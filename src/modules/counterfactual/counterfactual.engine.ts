export interface CounterfactualResult {
  confidence: number;
  isPoisoned: boolean;
  explanation: string;
}

export interface MemoryContentPair {
  memoryId: string;
  content: Record<string, unknown>;
}

function flattenContent(content: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(content)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenContent(value as Record<string, unknown>, path));
    } else {
      result[path] = value;
    }
  }
  return result;
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

export class CounterfactualEngine {
  analyze(
    candidate: Record<string, unknown>,
    peers: Record<string, unknown>[],
    poisonThreshold = 30,
  ): CounterfactualResult {
    if (peers.length < 2) {
      return {
        confidence: 0,
        isPoisoned: false,
        explanation: 'Insufficient related memories for counterfactual analysis',
      };
    }

    const candidateFlat = flattenContent(candidate);
    const peerFlats = peers.map((p) => flattenContent(p));
    const outlierKeys: string[] = [];
    let comparableKeys = 0;

    for (const [key, candidateValue] of Object.entries(candidateFlat)) {
      const peerValues = peerFlats
        .map((pf) => pf[key])
        .filter((v) => v !== undefined);

      if (peerValues.length < 2) continue;
      comparableKeys += 1;

      const consensus = modeValue(peerValues);
      if (JSON.stringify(candidateValue) !== JSON.stringify(consensus)) {
        outlierKeys.push(key);
      }
    }

    if (comparableKeys === 0) {
      return {
        confidence: 0,
        isPoisoned: false,
        explanation: 'No comparable keys between candidate and peer memories',
      };
    }

    const confidence = Math.round((outlierKeys.length / comparableKeys) * 100);
    const isPoisoned = outlierKeys.length > 0 && confidence >= poisonThreshold;

    const explanation =
      outlierKeys.length === 0
        ? 'No counterfactual conflicts detected'
        : outlierKeys
            .map((key) => {
              const candidateValue = candidateFlat[key];
              const peerValues = peerFlats.map((pf) => pf[key]).filter((v) => v !== undefined);
              const consensus = modeValue(peerValues);
              return `${key}: candidate ${JSON.stringify(candidateValue)} vs consensus ${JSON.stringify(consensus)}`;
            })
            .join('; ');

    return { confidence, isPoisoned, explanation };
  }
}
