import { getFactValue } from '../../shared/utils/content-normalizer';
import { getEnv } from '../../infrastructure/config/env';
import { CounterfactualEngine, CounterfactualResult } from './counterfactual.engine';
import { LlmEvaluator } from './llm-evaluator';
import { MemoryService } from '../memory/memory.service';
import { CredentialService } from '../credential/credential.service';
import { TrustEvaluationService } from '../trust-evaluation/trust-evaluation.service';

interface RetrievalCandidate {
  memoryId: string;
  content: Record<string, unknown>;
  createdAt: Date;
}

function modeValue(values: unknown[]): unknown {
  const counts = new Map<string, { value: unknown; count: number }>();
  for (const v of values) {
    const key = JSON.stringify(v);
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { value: v, count: 1 });
    }
  }
  const sorted = [...counts.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return JSON.stringify(a.value).localeCompare(JSON.stringify(b.value));
  });
  return sorted[0]?.value;
}

export class CounterfactualService {
  private readonly engine = new CounterfactualEngine();
  private readonly llm = new LlmEvaluator();

  constructor(
    private readonly memoryService: MemoryService,
    private readonly credentialService: CredentialService,
    private readonly trustEvaluationService: TrustEvaluationService,
  ) {}

  async evaluate(memoryId: string) {
    const candidate = await this.memoryService.getMemory(memoryId);
    const content = candidate.content as Record<string, unknown>;
    const related = await this.memoryService.getRelatedMemories(memoryId);

    const candidates = [
      { memoryId, content },
      ...related.map((m) => ({
        memoryId: m.memoryId,
        content: m.content as Record<string, unknown>,
      })),
    ];

    const analysis = await this.analyzeCandidateAgainstAgent(memoryId, candidates, content);

    const scoreDelta = analysis.isPoisoned ? -Math.round(analysis.confidence * 0.8) : 0;

    await this.trustEvaluationService.recordCounterfactual(memoryId, analysis, scoreDelta);

    if (analysis.isPoisoned) {
      await this.credentialService.applyPoisonPenalty(memoryId, analysis.confidence);
    }

    const credential = await this.credentialService.getByMemoryId(memoryId);

    return {
      memoryId,
      ...analysis,
      credential: {
        trustScore: credential.trustScore,
        status: credential.status,
      },
    };
  }

  /** Shared logic for explicit evaluate — same rules as retrieval query. */
  private async analyzeCandidateAgainstAgent(
    memoryId: string,
    candidates: { memoryId: string; content: Record<string, unknown> }[],
    content: Record<string, unknown>,
  ): Promise<CounterfactualResult> {
    const contentKeys = Object.keys(content);

    if (contentKeys.length === 0) {
      return {
        confidence: 0,
        isPoisoned: false,
        explanation: 'No content keys to analyze',
      };
    }

    let worst: CounterfactualResult = {
      confidence: 0,
      isPoisoned: false,
      explanation: 'No counterfactual conflicts detected',
    };

    for (const key of contentKeys) {
      const results = await this.analyzeForRetrieval(candidates, key);
      const keyAnalysis = results.get(memoryId);
      if (!keyAnalysis) continue;

      if (
        keyAnalysis.isPoisoned &&
        (!worst.isPoisoned || keyAnalysis.confidence > worst.confidence)
      ) {
        worst = keyAnalysis;
      }
    }

    return worst;
  }

  /**
   * Retrieval-time analysis: query-level consensus + related-memory engine fallback.
   */
  async analyzeForRetrieval(
    candidates: { memoryId: string; content: Record<string, unknown> }[],
    queryKey?: string,
    poisonThreshold?: number,
  ): Promise<Map<string, CounterfactualResult>> {
    const env = getEnv();
    const threshold = poisonThreshold ?? env.COUNTERFACTUAL_POISON_THRESHOLD;
    const results = new Map<string, CounterfactualResult>();

    const withMeta: RetrievalCandidate[] = await Promise.all(
      candidates.map(async (c) => {
        const memory = await this.memoryService.getMemory(c.memoryId);
        return { ...c, createdAt: memory.createdAt };
      }),
    );

    let queryConsensus: unknown;
    if (queryKey && withMeta.length > 0) {
      queryConsensus = this.resolveQueryConsensus(withMeta, queryKey);
    }

    for (const candidate of withMeta) {
      if (queryKey && queryConsensus !== undefined && withMeta.length > 1) {
        const candidateValue = getFactValue(candidate.content, queryKey);
        if (JSON.stringify(candidateValue) !== JSON.stringify(queryConsensus)) {
          let analysis: CounterfactualResult = {
            confidence: 100,
            isPoisoned: true,
            explanation: `${queryKey}: candidate ${JSON.stringify(candidateValue)} vs query consensus ${JSON.stringify(queryConsensus)}`,
          };
          analysis = await this.enrichWithLlm(queryKey, candidateValue, queryConsensus, analysis);
          results.set(candidate.memoryId, analysis);
          continue;
        }

        results.set(candidate.memoryId, {
          confidence: 0,
          isPoisoned: false,
          explanation: 'Matches query consensus',
        });
        continue;
      }

      const related = await this.memoryService.getRelatedMemories(candidate.memoryId);
      const olderPeers = related.filter((r) => r.createdAt < candidate.createdAt);
      const peerContents = (olderPeers.length > 0 ? olderPeers : related).map(
        (m) => m.content as Record<string, unknown>,
      );

      let analysis = this.engine.analyze(candidate.content, peerContents, threshold);

      if (
        !analysis.isPoisoned &&
        analysis.explanation.includes('Insufficient') &&
        olderPeers.length >= 1 &&
        queryKey
      ) {
        const candidateValue = getFactValue(candidate.content, queryKey);
        const peerValues = olderPeers.map((p) =>
          getFactValue(p.content as Record<string, unknown>, queryKey),
        );
        const peerConsensus = modeValue(peerValues);
        if (JSON.stringify(candidateValue) !== JSON.stringify(peerConsensus)) {
          analysis = {
            confidence: 100,
            isPoisoned: true,
            explanation: `${queryKey}: candidate ${JSON.stringify(candidateValue)} vs established consensus ${JSON.stringify(peerConsensus)}`,
          };
          analysis = await this.enrichWithLlm(queryKey, candidateValue, peerConsensus, analysis);
        }
      }

      if (analysis.isPoisoned && queryKey) {
        const candidateValue = getFactValue(candidate.content, queryKey);
        const peerValues = peerContents.map((p) => getFactValue(p, queryKey)).filter((v) => v !== undefined);
        if (peerValues.length > 0) {
          analysis = await this.enrichWithLlm(queryKey, candidateValue, modeValue(peerValues), analysis);
        }
      }

      results.set(candidate.memoryId, analysis);
    }

    return results;
  }

  private async enrichWithLlm(
    key: string,
    candidateValue: unknown,
    consensus: unknown,
    base: CounterfactualResult,
  ): Promise<CounterfactualResult> {
    const llm = await this.llm.evaluateConflict(key, candidateValue, [consensus]);
    if (!llm) return base;
    return {
      ...base,
      confidence: Math.max(base.confidence, llm.confidence),
      explanation: llm.contradicts
        ? `${base.explanation} — Reason: ${llm.reason} (LLM confidence: ${llm.confidence}%)`
        : base.explanation,
    };
  }

  /** On tie, prefer the value held by the oldest memory (established fact). */
  private resolveQueryConsensus(candidates: RetrievalCandidate[], queryKey: string): unknown {
    const groups = new Map<string, { value: unknown; count: number; oldest: Date }>();

    for (const candidate of candidates) {
      const value = getFactValue(candidate.content, queryKey);
      const key = JSON.stringify(value);
      const existing = groups.get(key);
      if (existing) {
        existing.count += 1;
        if (candidate.createdAt < existing.oldest) {
          existing.oldest = candidate.createdAt;
        }
      } else {
        groups.set(key, { value, count: 1, oldest: candidate.createdAt });
      }
    }

    const sorted = [...groups.values()].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.oldest.getTime() - b.oldest.getTime();
    });

    return sorted[0]?.value;
  }
}
