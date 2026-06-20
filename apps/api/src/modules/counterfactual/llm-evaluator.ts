import { getEnv } from '../../infrastructure/config/env';

export interface LlmConflictResult {
  contradicts: boolean;
  confidence: number;
  reason: string;
}

export class LlmEvaluator {
  async evaluateConflict(
    key: string,
    candidateValue: unknown,
    peerValues: unknown[],
  ): Promise<LlmConflictResult | null> {
    const env = getEnv();
    if (env.LLM_PROVIDER === 'none' || !env.LLM_API_KEY) {
      return null;
    }

    const prompt = `You are a memory integrity analyst for AI agents.
Does the candidate fact contradict the established peer facts?

Key: ${key}
Candidate: ${JSON.stringify(candidateValue)}
Peer facts: ${JSON.stringify(peerValues)}

Respond with JSON only: {"contradicts": boolean, "confidence": 0-100, "reason": "one sentence"}`;

    try {
      if (env.LLM_PROVIDER === 'openai') {
        return await this.callOpenAi(env.LLM_API_KEY, env.LLM_MODEL, prompt);
      }
      if (env.LLM_PROVIDER === 'anthropic') {
        return await this.callAnthropic(env.LLM_API_KEY, env.LLM_MODEL, prompt);
      }
    } catch (err) {
      console.warn('[LlmEvaluator] failed:', err instanceof Error ? err.message : err);
    }

    return null;
  }

  private async callOpenAi(apiKey: string, model: string, prompt: string): Promise<LlmConflictResult> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI error ${res.status}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? '{}';
    return this.parseResult(text);
  }

  private async callAnthropic(apiKey: string, model: string, prompt: string): Promise<LlmConflictResult> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-haiku-20241022',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Anthropic error ${res.status}`);
    }

    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text = data.content?.find((c) => c.type === 'text')?.text ?? '{}';
    return this.parseResult(text);
  }

  private parseResult(text: string): LlmConflictResult {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] ?? text) as {
      contradicts?: boolean;
      confidence?: number;
      reason?: string;
    };
    return {
      contradicts: Boolean(parsed.contradicts),
      confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 0)),
      reason: String(parsed.reason ?? 'LLM conflict analysis'),
    };
  }
}
