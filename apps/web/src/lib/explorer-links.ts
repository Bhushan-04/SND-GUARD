const DEFAULT_AGGREGATOR =
  process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL ??
  'https://aggregator.walrus-testnet.walrus.space';

export function walrusBlobUrl(blobId: string | null | undefined): string | null {
  if (!blobId) return null;
  const id = blobId.startsWith('walrus://') ? blobId.slice('walrus://'.length) : blobId;
  return `${DEFAULT_AGGREGATOR.replace(/\/$/, '')}/v1/blobs/${encodeURIComponent(id)}`;
}

export function suiObjectUrl(objectId: string | null | undefined): string | null {
  if (!objectId || !objectId.startsWith('0x')) return null;
  return `https://testnet.suivision.xyz/object/${objectId}`;
}

export function suiTxUrl(digest: string | null | undefined): string | null {
  if (!digest) return null;
  return `https://testnet.suivision.xyz/txblock/${digest}`;
}

export function truncateRef(ref: string, head = 8, tail = 6): string {
  if (ref.length <= head + tail + 3) return ref;
  return `${ref.slice(0, head)}…${ref.slice(-tail)}`;
}
