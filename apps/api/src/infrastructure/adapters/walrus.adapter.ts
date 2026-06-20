import { PrismaClient } from '@prisma/client';
import { ProofPayload, WalrusAdapter } from './types';

export class LocalWalrusAdapter implements WalrusAdapter {
  constructor(private readonly prisma: PrismaClient) {}

  async storeProof(contentHash: string, payload: ProofPayload): Promise<string> {
    const walrusObjectId = `walrus://proof/${contentHash.slice(0, 16)}`;
    await this.prisma.memoryAsset.update({
      where: { memoryId: payload.memoryId },
      data: { walrusObjectId },
    });
    return walrusObjectId;
  }

  async verifyProof(walrusObjectId: string, contentHash: string): Promise<boolean> {
    const memory = await this.prisma.memoryAsset.findFirst({
      where: { walrusObjectId },
    });
    if (!memory) return false;
    return memory.contentHash === contentHash;
  }
}
