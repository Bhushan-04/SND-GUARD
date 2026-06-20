import { NotFoundError } from '../../shared/errors/app-error';
import { getEnv } from '../../infrastructure/config/env';
import { MemoryRepository } from './memory.repository';

export class MemoryService {
  constructor(private readonly memoryRepo: MemoryRepository) {}

  async getMemory(memoryId: string) {
    const memory = await this.memoryRepo.findById(memoryId);
    if (!memory) {
      throw new NotFoundError(`Memory ${memoryId} not found`);
    }
    return memory;
  }

  async getRelatedMemories(memoryId: string) {
    const memory = await this.getMemory(memoryId);
    const env = getEnv();
    return this.memoryRepo.findRecentBySourceAgent(
      memory.sourceAgent,
      memoryId,
      env.COUNTERFACTUAL_RELATED_LIMIT,
    );
  }

  async listByAgent(sourceAgent: string) {
    const memories = await this.memoryRepo.findBySourceAgent(sourceAgent);
    return memories.map((m) => ({
      memoryId: m.memoryId,
      content: m.content as Record<string, unknown>,
      contentHash: m.contentHash,
      sourceAgent: m.sourceAgent,
      createdAt: m.createdAt,
      memwalRef: m.memwalRef,
      walrusObjectId: m.walrusObjectId,
      suiCredentialRef: m.suiCredentialRef,
      credential: m.credential
        ? { trustScore: m.credential.trustScore, status: m.credential.status }
        : null,
    }));
  }
}
