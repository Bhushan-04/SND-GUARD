import { NotFoundError } from '../../shared/errors/app-error';
import { MemoryService } from '../memory/memory.service';
import { CredentialService } from '../credential/credential.service';
import { TrustEvaluationService } from '../trust-evaluation/trust-evaluation.service';
import { ProvenanceRepository } from '../memory/memory.repository';

export class AuditService {
  constructor(
    private readonly memoryService: MemoryService,
    private readonly provenanceRepo: ProvenanceRepository,
    private readonly credentialService: CredentialService,
    private readonly trustEvaluationService: TrustEvaluationService,
  ) {}

  async getFullAudit(memoryId: string) {
    const memory = await this.memoryService.getMemory(memoryId);
    const provenance = await this.provenanceRepo.findByMemoryId(memoryId);

    let credential;
    try {
      credential = await this.credentialService.getByMemoryId(memoryId);
    } catch {
      throw new NotFoundError(`Credential not found for memory ${memoryId}`);
    }

    const trustEvaluations = await this.trustEvaluationService.getHistory(memoryId);
    const latestCf = await this.trustEvaluationService.getLatestCounterfactual(memoryId);

    return {
      memory: {
        memoryId: memory.memoryId,
        contentHash: memory.contentHash,
        content: memory.content,
        sourceAgent: memory.sourceAgent,
        memwalRef: memory.memwalRef,
        walrusObjectId: memory.walrusObjectId,
        suiCredentialRef: memory.suiCredentialRef,
        createdAt: memory.createdAt,
      },
      provenance: provenance.map((p) => ({
        provenanceId: p.provenanceId,
        creatorAgent: p.creatorAgent,
        sourceType: p.sourceType,
        ingestionPath: p.ingestionPath,
        createdAt: p.createdAt,
      })),
      credential: {
        credentialId: credential.credentialId,
        trustScore: credential.trustScore,
        status: credential.status,
        issuedAt: credential.issuedAt,
        updatedAt: credential.updatedAt,
      },
      trustEvaluations: trustEvaluations.map((e) => ({
        evaluationId: e.evaluationId,
        evaluatorType: e.evaluatorType,
        scoreDelta: e.scoreDelta,
        result: e.result,
        reason: e.reason,
        confidence: e.confidence,
        createdAt: e.createdAt,
      })),
      counterfactualEvidence: latestCf
        ? {
            latestResult: latestCf.result,
            confidence: latestCf.confidence,
            explanation: latestCf.reason,
            evaluatedAt: latestCf.createdAt,
          }
        : null,
    };
  }
}
