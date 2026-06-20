import { CredentialStatus } from '@prisma/client';
import { NotFoundError } from '../../shared/errors/app-error';
import { getEnv } from '../../infrastructure/config/env';
import { SuiAdapter } from '../../infrastructure/adapters/types';
import { CredentialRepository, MemoryRepository } from '../memory/memory.repository';

export class CredentialService {
  constructor(
    private readonly credentialRepo: CredentialRepository,
    private readonly memoryRepo: MemoryRepository,
    private readonly suiAdapter: SuiAdapter,
  ) {}

  async getByMemoryId(memoryId: string) {
    const credential = await this.credentialRepo.findByMemoryId(memoryId);
    if (!credential) {
      throw new NotFoundError(`Credential not found for memory ${memoryId}`);
    }
    return credential;
  }

  async revoke(memoryId: string) {
    await this.getByMemoryId(memoryId);
    await this.revokeOnChain(memoryId);
    return this.credentialRepo.updateTrustAndStatus(memoryId, 0, CredentialStatus.REVOKED);
  }

  async applyPoisonPenalty(memoryId: string, confidence: number) {
    const env = getEnv();
    const credential = await this.getByMemoryId(memoryId);

    if (credential.status === CredentialStatus.REVOKED) {
      return credential;
    }

    if (confidence >= env.COUNTERFACTUAL_AUTO_REVOKE_THRESHOLD) {
      await this.revokeOnChain(memoryId);
      await this.emitPoisonOnChain(memoryId, confidence);
      return this.credentialRepo.updateTrustAndStatus(memoryId, 0, CredentialStatus.REVOKED);
    }

    const newScore = Math.max(0, Math.round(100 - confidence * 0.8));
    return this.credentialRepo.updateTrustAndStatus(
      memoryId,
      newScore,
      CredentialStatus.SUSPICIOUS,
    );
  }

  isConsumable(credential: { trustScore: number; status: CredentialStatus }): boolean {
    const env = getEnv();
    return (
      credential.status === CredentialStatus.ACTIVE &&
      credential.trustScore >= env.MIN_CONSUMABLE_TRUST_SCORE
    );
  }

  private async revokeOnChain(memoryId: string): Promise<void> {
    const memory = await this.memoryRepo.findById(memoryId);
    if (!memory?.suiCredentialRef) return;

    try {
      await this.suiAdapter.revokeCredential(memory.suiCredentialRef);
    } catch (err) {
      console.warn('[CredentialService] on-chain revoke failed:', err);
    }
  }

  private async emitPoisonOnChain(memoryId: string, confidence: number): Promise<void> {
    try {
      await this.suiAdapter.reportPoisonDetected(memoryId, confidence);
    } catch (err) {
      console.warn('[CredentialService] poison event emit failed:', err);
    }
  }
}
