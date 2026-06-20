'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { MemoryListItem } from '@snd-guard/shared';
import { TrustBadge } from '@/components/trust-badge';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { sndGuard } from '@/lib/api';
import { DEFAULT_AGENT } from '@/lib/utils';

export default function DashboardOverviewPage() {
  const [memories, setMemories] = useState<MemoryListItem[]>([]);
  const [consensus, setConsensus] = useState<string>('—');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await sndGuard.listMemories(DEFAULT_AGENT);
        setMemories(list);
        const q = await sndGuard.queryMemories(DEFAULT_AGENT, 'transactionLimit');
        setConsensus(JSON.stringify(q.consensusValue));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      }
    })();
  }, []);

  const active = memories.filter((m) => m.credential?.status === 'ACTIVE').length;
  const revoked = memories.filter((m) => m.credential?.status === 'REVOKED').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Overview</h1>
        <p className="mt-1 text-slate-400">Agent memory trust posture for {DEFAULT_AGENT}</p>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total memories', value: memories.length },
          { label: 'ACTIVE', value: active },
          { label: 'REVOKED', value: revoked },
          { label: 'Query consensus', value: consensus, mono: true },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardDescription>{stat.label}</CardDescription>
            <p className={stat.mono ? 'mt-2 font-mono text-lg text-cyan-300' : 'mt-2 text-3xl font-semibold'}>
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle>Recent memories</CardTitle>
        <div className="mt-4 divide-y divide-slate-800">
          {memories.slice(0, 5).map((m) => (
            <Link
              key={m.memoryId}
              href={`/dashboard/memories/${m.memoryId}`}
              className="flex flex-wrap items-center justify-between gap-2 py-3 transition hover:bg-slate-800/30"
            >
              <span className="font-mono text-xs text-slate-400">{m.memoryId}</span>
              {m.credential && (
                <TrustBadge status={m.credential.status} score={m.credential.trustScore} />
              )}
            </Link>
          ))}
          {memories.length === 0 && (
            <p className="py-6 text-sm text-slate-500">No memories yet — run the demo first.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
