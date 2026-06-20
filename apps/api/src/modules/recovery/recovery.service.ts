import { NotFoundError } from '../../shared/errors/app-error';
import { MemWalAdapter } from '../../infrastructure/adapters/types';
import { RecoveryRepository } from '../memory/memory.repository';
import { MemoryService } from '../memory/memory.service';

export interface CreateSnapshotInput {
  reason: string;
  sourceAgent: string;
  safeMemoryIds: string[];
}

export interface RestoreSnapshotInput {
  snapshotId?: string;
  sourceAgent: string;
}

export class RecoveryService {
  constructor(
    private readonly recoveryRepo: RecoveryRepository,
    private readonly memoryService: MemoryService,
    private readonly memWalAdapter: MemWalAdapter,
  ) {}

  async createSnapshot(input: CreateSnapshotInput) {
    for (const memoryId of input.safeMemoryIds) {
      await this.memoryService.getMemory(memoryId);
    }

    const snapshot = await this.recoveryRepo.create(
      input.reason,
      input.sourceAgent,
      input.safeMemoryIds,
    );

    return {
      snapshotId: snapshot.snapshotId,
      reason: snapshot.reason,
      sourceAgent: snapshot.sourceAgent,
      safeMemorySet: input.safeMemoryIds,
      createdAt: snapshot.createdAt,
    };
  }

  async restoreFromSnapshot(input: RestoreSnapshotInput) {
    const snapshot = input.snapshotId
      ? await this.recoveryRepo.findById(input.snapshotId)
      : await this.recoveryRepo.findLatestBySourceAgent(input.sourceAgent);

    if (!snapshot) {
      throw new NotFoundError('Recovery snapshot not found');
    }

    const safeMemoryIds = snapshot.safeMemorySet as string[];
    await this.memWalAdapter.restoreSafeSet(snapshot.sourceAgent, safeMemoryIds);

    const memories = await Promise.all(
      safeMemoryIds.map(async (memoryId) => {
        const memory = await this.memoryService.getMemory(memoryId);
        return {
          memoryId: memory.memoryId,
          content: memory.content,
          contentHash: memory.contentHash,
        };
      }),
    );

    return {
      snapshotId: snapshot.snapshotId,
      sourceAgent: snapshot.sourceAgent,
      reason: snapshot.reason,
      restoredMemories: memories,
      restoredAt: new Date(),
    };
  }
}
