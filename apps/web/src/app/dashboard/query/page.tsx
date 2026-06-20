'use client';

import { FormEvent, useState } from 'react';
import type { QueryMemoriesResult } from '@snd-guard/shared';
import { BlockedMemoryList, ConsensusPanel } from '@/components/consensus-panel';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { sndGuard } from '@/lib/api';
import { DEFAULT_AGENT } from '@/lib/utils';

export default function QueryPage() {
  const [result, setResult] = useState<QueryMemoriesResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    try {
      const agent = String(fd.get('sourceAgent') || DEFAULT_AGENT);
      const key = String(fd.get('key') || '');
      setResult(await sndGuard.queryMemories(agent, key || undefined));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Query console</h1>
        <p className="text-slate-400">Consumption gate — counterfactual consensus</p>
      </div>

      <Card>
        <CardTitle>Parameters</CardTitle>
        <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
          <input
            name="sourceAgent"
            defaultValue={DEFAULT_AGENT}
            placeholder="sourceAgent"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
          <input
            name="key"
            defaultValue="transactionLimit"
            placeholder="key (optional)"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
          <Button type="submit" disabled={loading} className="sm:col-span-2 sm:w-fit">
            {loading ? 'Querying…' : 'Run query'}
          </Button>
        </form>
      </Card>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      {result && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ConsensusPanel result={result} />
          <BlockedMemoryList blocked={result.blocked} />
        </div>
      )}
    </div>
  );
}
