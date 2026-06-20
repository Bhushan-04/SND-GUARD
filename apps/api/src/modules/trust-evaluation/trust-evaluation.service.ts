import { EvaluationResult, EvaluatorType } from '@prisma/client';
import { TrustEvaluationRepository } from '../memory/memory.repository';
import { CounterfactualResult } from '../counterfactual/counterfactual.engine';

export class TrustEvaluationService {
  constructor(private readonly evaluationRepo: TrustEvaluationRepository) {}

  async getHistory(memoryId: string) {
    return this.evaluationRepo.findByMemoryId(memoryId);
  }

  async recordCounterfactual(
    memoryId: string,
    analysis: CounterfactualResult,
    scoreDelta: number,
  ) {
    return this.evaluationRepo.create({
      memoryId,
      evaluatorType: EvaluatorType.COUNTERFACTUAL,
      scoreDelta,
      result: analysis.isPoisoned ? EvaluationResult.FAIL : EvaluationResult.PASS,
      reason: analysis.explanation,
      confidence: analysis.confidence,
    });
  }

  async recordIntegrityFailure(memoryId: string, reason: string) {
    return this.evaluationRepo.create({
      memoryId,
      evaluatorType: EvaluatorType.ANOMALY,
      scoreDelta: -100,
      result: EvaluationResult.FAIL,
      reason,
    });
  }

  async getLatestCounterfactual(memoryId: string) {
    return this.evaluationRepo.findLatestCounterfactual(memoryId);
  }
}
