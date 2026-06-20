import { PrismaClient } from '@prisma/client';
import { extractBlobId, WalrusHttpAdapter } from './walrus-http.adapter';
import { MemWalAdapter, MemWalCandidate, MemoryQuery } from './types';

export class WalrusMemWalAdapter implements MemWalAdapter {
  constructor(
    private readonly walrus: WalrusHttpAdapter,
    private readonly prisma: PrismaClient,
  ) {}

  async storeContent(memoryId: string, content: Record<string, unknown>): Promise<string> {
    const blobId = await this.walrus.storeContent(content);
    const memwalRef = `walrus://${blobId}`;
    await this.prisma.memoryAsset.update({
      where: { memoryId },
      data: { memwalRef },
    });
    return memwalRef;
  }

  async fetchCandidates(query: MemoryQuery): Promise<MemWalCandidate[]> {
    const memories = await this.prisma.memoryAsset.findMany({
      where: { sourceAgent: query.sourceAgent },
      orderBy: { createdAt: 'desc' },
    });

    return memories
      .filter((m) => {
        if (!query.key) return true;
        const content = m.content as Record<string, unknown>;
        return (
          query.key in content ||
          Object.keys(content).some((k) => k.toLowerCase() === query.key!.toLowerCase())
        );
      })
      .map((m) => ({
        memoryId: m.memoryId,
        content: m.content as Record<string, unknown>,
        memwalRef: m.memwalRef ?? `memwal://${m.memoryId}`,
      }));
  }

  async restoreSafeSet(sourceAgent: string, memoryIds: string[]): Promise<void> {
    console.info(
      `[MemWal/Walrus] Restored safe set for ${sourceAgent}: ${memoryIds.join(', ')}`,
    );
  }

  async retrieveFromRef(memwalRef: string): Promise<Record<string, unknown>> {
    const blobId = extractBlobId(memwalRef.replace(/^memwal:\/\//, '').replace(/^walrus:\/\//, ''));
    return this.walrus.fetchContent(blobId);
  }
}
