import { CredentialStatus } from '@prisma/client';
import { getFactValue } from '../../shared/utils/content-normalizer';
import { MemWalAdapter } from '../../infrastructure/adapters/types';
import { IntegrityService } from '../integrity/integrity.service';
import { CredentialService } from '../credential/credential.service';
import { CounterfactualService } from '../counterfactual/counterfactual.service';
import { TrustEvaluationService } from '../trust-evaluation/trust-evaluation.service';

export interface QueryMemoriesInput {
  sourceAgent: string;
  key?: string;
}

export class RetrievalService {
  constructor(
    private readonly memWalAdapter: MemWalAdapter,
    private readonly integrityService: IntegrityService,
    private readonly credentialService: CredentialService,
    private readonly counterfactualService: CounterfactualService,
    private readonly trustEvaluationService: TrustEvaluationService,
  ) {}

  async queryMemories(input: QueryMemoriesInput) {
    const candidates = await this.memWalAdapter.fetchCandidates(input);

    const verified: { memoryId: string; content: Record<string, unknown> }[] = [];
    const blocked: {
      memoryId: string;
      reason: string;
      trustScore?: number;
      status?: CredentialStatus;
    }[] = [];

    for (const candidate of candidates) {
      const integrityOk = await this.integrityService.verifyMemory(
        candidate.memoryId,
        candidate.content,
      );
      if (!integrityOk) {
        const cred = await this.credentialService.getByMemoryId(candidate.memoryId);
        blocked.push({
          memoryId: candidate.memoryId,
          reason: 'Integrity verification failed',
          trustScore: cred.trustScore,
          status: cred.status,
        });
        continue;
      }

      let credential;
      try {
        credential = await this.credentialService.getByMemoryId(candidate.memoryId);
      } catch {
        blocked.push({ memoryId: candidate.memoryId, reason: 'No credential found' });
        continue;
      }

      if (credential.status === CredentialStatus.REVOKED) {
        blocked.push({
          memoryId: candidate.memoryId,
          reason: 'Memory revoked',
          trustScore: credential.trustScore,
          status: credential.status,
        });
        continue;
      }

      verified.push({ memoryId: candidate.memoryId, content: candidate.content });
    }

    const analysisResults = await this.counterfactualService.analyzeForRetrieval(
      verified,
      input.key,
    );

    const allowed: {
      memoryId: string;
      value: unknown;
      trustScore: number;
      status: CredentialStatus;
    }[] = [];

    for (const item of verified) {
      const analysis = analysisResults.get(item.memoryId);
      if (!analysis) continue;

      if (analysis.isPoisoned) {
        const scoreDelta = -Math.round(analysis.confidence * 0.8);
        await this.trustEvaluationService.recordCounterfactual(item.memoryId, analysis, scoreDelta);
        const updatedCred = await this.credentialService.applyPoisonPenalty(
          item.memoryId,
          analysis.confidence,
        );

        blocked.push({
          memoryId: item.memoryId,
          reason: analysis.explanation,
          trustScore: updatedCred.trustScore,
          status: updatedCred.status,
        });
        continue;
      }

      const credential = await this.credentialService.getByMemoryId(item.memoryId);
      if (!this.credentialService.isConsumable(credential)) {
        blocked.push({
          memoryId: item.memoryId,
          reason: 'Trust score below consumable threshold',
          trustScore: credential.trustScore,
          status: credential.status,
        });
        continue;
      }

      const value = input.key
        ? getFactValue(item.content, input.key)
        : item.content;

      allowed.push({
        memoryId: item.memoryId,
        value,
        trustScore: credential.trustScore,
        status: credential.status,
      });
    }

    let consensusValue: unknown = null;
    if (input.key && allowed.length > 0) {
      const values = allowed.map((a) => a.value);
      const counts = new Map<string, number>();
      for (const v of values) {
        const key = JSON.stringify(v);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      const top = [...counts.entries()].sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      })[0];
      consensusValue = top ? JSON.parse(top[0]) : null;
    }

    return {
      query: input,
      consensusValue,
      memories: allowed,
      blocked,
    };
  }
}
