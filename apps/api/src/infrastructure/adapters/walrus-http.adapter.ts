import { createHash } from 'crypto';
import { getEnv } from '../config/env';
import { ProofPayload, WalrusAdapter } from './types';

interface WalrusStoreResponse {
  newlyCreated?: {
    blobObject?: { blobId?: string };
  };
  alreadyCertified?: {
    blobId?: string;
  };
}

export class WalrusHttpAdapter implements WalrusAdapter {
  private readonly publisherUrl: string;
  private readonly aggregatorUrl: string;

  constructor() {
    const env = getEnv();
    this.publisherUrl = env.WALRUS_PUBLISHER_URL.replace(/\/$/, '');
    this.aggregatorUrl = env.WALRUS_AGGREGATOR_URL.replace(/\/$/, '');
  }

  async storeProof(contentHash: string, payload: ProofPayload): Promise<string> {
    const body = JSON.stringify({
      memoryId: payload.memoryId,
      contentHash,
      content: payload.content ?? null,
      storedAt: new Date().toISOString(),
    });

    const res = await fetch(`${this.publisherUrl}/v1/blobs?epochs=5`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Walrus store failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const data = (await res.json()) as WalrusStoreResponse;
    const blobId =
      data.newlyCreated?.blobObject?.blobId ?? data.alreadyCertified?.blobId;

    if (!blobId) {
      throw new Error('Walrus store response missing blobId');
    }

    return blobId;
  }

  async verifyProof(walrusObjectId: string, contentHash: string): Promise<boolean> {
    const blobId = extractBlobId(walrusObjectId);
    const res = await fetch(`${this.aggregatorUrl}/v1/blobs/${encodeURIComponent(blobId)}`);

    if (!res.ok) {
      return false;
    }

    const raw = await res.text();
    try {
      const parsed = JSON.parse(raw) as { contentHash?: string; content?: unknown };
      if (parsed.contentHash === contentHash) {
        return true;
      }
      if (parsed.content !== undefined && parsed.content !== null) {
        const canonical = JSON.stringify(
          Object.keys(parsed.content as Record<string, unknown>)
            .sort()
            .reduce<Record<string, unknown>>((acc, key) => {
              acc[key] = (parsed.content as Record<string, unknown>)[key];
              return acc;
            }, {}),
        );
        const hash = createHash('sha256').update(canonical).digest('hex');
        return hash === contentHash;
      }
    } catch {
      // fall through to raw hash check
    }

    const rawHash = createHash('sha256').update(raw).digest('hex');
    return rawHash === contentHash;
  }

  async storeContent(content: Record<string, unknown>): Promise<string> {
    const body = JSON.stringify(content);
    const res = await fetch(`${this.publisherUrl}/v1/blobs?epochs=5`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Walrus content store failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const data = (await res.json()) as WalrusStoreResponse;
    const blobId =
      data.newlyCreated?.blobObject?.blobId ?? data.alreadyCertified?.blobId;

    if (!blobId) {
      throw new Error('Walrus store response missing blobId');
    }

    return blobId;
  }

  async fetchContent(blobId: string): Promise<Record<string, unknown>> {
    const id = extractBlobId(blobId);
    const res = await fetch(`${this.aggregatorUrl}/v1/blobs/${encodeURIComponent(id)}`);

    if (!res.ok) {
      throw new Error(`Walrus fetch failed (${res.status})`);
    }

    const raw = await res.text();
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed.content && typeof parsed.content === 'object' && !Array.isArray(parsed.content)) {
      return parsed.content as Record<string, unknown>;
    }
    return parsed;
  }

  aggregatorUrlFor(blobId: string): string {
    return `${this.aggregatorUrl}/v1/blobs/${encodeURIComponent(extractBlobId(blobId))}`;
  }
}

export function extractBlobId(ref: string): string {
  if (ref.startsWith('walrus://')) {
    return ref.slice('walrus://'.length);
  }
  return ref;
}
