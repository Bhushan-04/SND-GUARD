'use client';

import type { QueryMemoriesResult } from '@snd-guard/shared';
import { TrustBadge } from '@/components/trust-badge';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const DEMO_SAFE_LIMIT = '$10K';
export const DEMO_POISON_LIMIT = '$50K';

export function LimitComparison({
  safeLimit = DEMO_SAFE_LIMIT,
  poisonLimit = DEMO_POISON_LIMIT,
  highlight,
  className,
}: {
  safeLimit?: string;
  poisonLimit?: string;
  highlight?: 'safe' | 'poison' | 'both';
  className?: string;
}) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2', className)}>
      <div
        className={cn(
          'rounded-xl border px-4 py-4 text-center',
          highlight === 'safe' || highlight === 'both'
            ? 'border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/20'
            : 'border-slate-800 bg-slate-950/50',
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/80">
          Safe memory
        </p>
        <p className="mt-2 text-3xl font-bold text-emerald-300">{safeLimit}</p>
        <p className="mt-1 text-xs text-slate-500">TreasuryAgent · legitimate policy</p>
      </div>
      <div
        className={cn(
          'rounded-xl border px-4 py-4 text-center',
          highlight === 'poison' || highlight === 'both'
            ? 'border-rose-500/40 bg-rose-500/10 ring-1 ring-rose-500/20'
            : 'border-slate-800 bg-slate-950/50',
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-400/80">
          Poison memory
        </p>
        <p className="mt-2 text-3xl font-bold text-rose-300">{poisonLimit}</p>
        <p className="mt-1 text-xs text-slate-500">AttackerDoc · injected document</p>
      </div>
    </div>
  );
}

export function ConsensusPanel({ result }: { result: QueryMemoriesResult }) {
  const consensus =
    typeof result.consensusValue === 'string'
      ? result.consensusValue
      : JSON.stringify(result.consensusValue);

  return (
    <Card className="border-emerald-500/30 bg-emerald-500/5">
      <CardTitle className="text-emerald-200">Allowed — agent consumes</CardTitle>
      <CardDescription>
        Consensus wins: oldest trusted {DEMO_SAFE_LIMIT} policy
      </CardDescription>
      <p className="mt-4 text-center text-4xl font-bold text-emerald-300">{consensus}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {result.memories.map((m) => (
          <TrustBadge key={m.memoryId} status={m.status} score={m.trustScore} />
        ))}
      </div>
    </Card>
  );
}

export function BlockedMemoryList({ blocked }: { blocked: QueryMemoriesResult['blocked'] }) {
  if (blocked.length === 0) {
    return (
      <Card>
        <CardTitle className="text-emerald-300">No blocked memories</CardTitle>
        <CardDescription>All conflicting memories passed the trust gate.</CardDescription>
      </Card>
    );
  }

  return (
    <Card className="border-rose-500/30 bg-rose-500/5">
      <CardTitle className="text-rose-300">Blocked — poison withheld</CardTitle>
      <CardDescription>
        Agent never sees {DEMO_POISON_LIMIT}; credential auto-revoked
      </CardDescription>
      <p className="mt-4 text-center text-4xl font-bold text-rose-300 line-through decoration-rose-400/60">
        {DEMO_POISON_LIMIT}
      </p>
      <ul className="mt-4 space-y-3">
        {blocked.map((item) => (
          <li
            key={item.memoryId}
            className="rounded-lg border border-rose-500/20 bg-slate-950/40 p-3 text-sm"
          >
            <p className="font-mono text-xs text-slate-400">{item.memoryId}</p>
            <p className="mt-1 text-rose-200">{item.reason}</p>
            {item.status && (
              <div className="mt-2">
                <TrustBadge status={item.status} score={item.trustScore} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
