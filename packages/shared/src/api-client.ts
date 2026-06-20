import type {
  AuditResult,
  CreateMemoryInput,
  EvaluateResult,
  MemoryListItem,
  MemoryRegistrationResult,
  QueryMemoriesResult,
} from './types';

export class SndGuardApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new SndGuardApiError(
      data?.error?.message ?? res.statusText,
      res.status,
      data?.error?.code,
    );
  }
  return data as T;
}

export function createSndGuardClient(baseUrl: string) {
  return {
    health: () => request<{ status: string }>(baseUrl, '/health'),
    createMemory: (body: CreateMemoryInput) =>
      request<MemoryRegistrationResult>(baseUrl, '/api/v1/memories', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    listMemories: (sourceAgent: string) =>
      request<MemoryListItem[]>(
        baseUrl,
        `/api/v1/memories?sourceAgent=${encodeURIComponent(sourceAgent)}`,
      ),
    queryMemories: (sourceAgent: string, key?: string) => {
      const params = new URLSearchParams({ sourceAgent });
      if (key) params.set('key', key);
      return request<QueryMemoriesResult>(baseUrl, `/api/v1/memories/query?${params}`);
    },
    getMemory: (id: string) => request<Record<string, unknown>>(baseUrl, `/api/v1/memories/${id}`),
    getTrust: (id: string) => request<Record<string, unknown>>(baseUrl, `/api/v1/memories/${id}/trust`),
    evaluate: (id: string) =>
      request<EvaluateResult>(baseUrl, `/api/v1/memories/${id}/evaluate`, { method: 'POST' }),
    getEvaluations: (id: string) =>
      request<{ memoryId: string; evaluations: unknown[] }>(
        baseUrl,
        `/api/v1/memories/${id}/evaluations`,
      ),
    revoke: (id: string) =>
      request<Record<string, unknown>>(baseUrl, `/api/v1/memories/${id}/revoke`, {
        method: 'POST',
      }),
    getAudit: (id: string) => request<AuditResult>(baseUrl, `/api/v1/audit/memory/${id}`),
    createSnapshot: (body: { reason: string; sourceAgent: string; safeMemoryIds: string[] }) =>
      request<Record<string, unknown>>(baseUrl, '/api/v1/recovery/snapshots', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    restore: (body: { sourceAgent: string; snapshotId?: string }) =>
      request<Record<string, unknown>>(baseUrl, '/api/v1/recovery/restore', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  };
}

export type SndGuardClient = ReturnType<typeof createSndGuardClient>;
