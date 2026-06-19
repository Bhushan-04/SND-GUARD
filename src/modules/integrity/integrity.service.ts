import { NotFoundError } from '../../shared/errors/app-error';
import { HashService } from '../../infrastructure/hash/hash.service';
import { WalrusAdapter } from '../../infrastructure/adapters/types';
import { MemoryRepository } from '../memory/memory.repository';
import { CredentialService } from '../credential/credential.service';
import { TrustEvaluationService } from '../trust-evaluation/trust-evaluation.service';

export class IntegrityService {
  constructor(
    private readonly memoryRepo: MemoryRepository,
    private readonly hashService: HashService,
    private readonly walrusAdapter: WalrusAdapter,
    private readonly credentialService: CredentialService,
    private readonly trustEvaluationService: TrustEvaluationService,
  ) {}

  async verifyMemory(memoryId: string, content: Record<string, unknown>): Promise<boolean> {
    const memory = await this.memoryRepo.findById(memoryId);
    if (!memory) {
      throw new NotFoundError(`Memory ${memoryId} not found`);
    }

    const recomputedHash = this.hashService.hashContent(content);

    if (recomputedHash !== memory.contentHash) {
      await this.trustEvaluationService.recordIntegrityFailure(
        memoryId,
        'Content hash mismatch — possible tampering detected',
      );
      await this.credentialService.revoke(memoryId);
      return false;
    }

    if (memory.walrusObjectId) {
      const proofValid = await this.walrusAdapter.verifyProof(memory.walrusObjectId, memory.contentHash);
      if (!proofValid) {
        await this.trustEvaluationService.recordIntegrityFailure(
          memoryId,
          'Walrus integrity proof verification failed',
        );
        await this.credentialService.revoke(memoryId);
        return false;
      }
    }

    return true;
  }
}
