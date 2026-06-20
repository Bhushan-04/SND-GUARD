'use client';

import type { CredentialStatus } from '@snd-guard/shared';
import { TrustBadge } from '@/components/trust-badge';
import { ProofLinks } from '@/components/proof-links';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { cn, formatDate, truncateId } from '@/lib/utils';

export type MemoryRole = 'safe' | 'poison';

const roleStyles: Record<MemoryRole, { badge: string; border: string; label: string }> = {
  safe: {
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    border: 'border-emerald-500/30',
    label: 'Safe memory',
  },
  poison: {
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    border: 'border-rose-500/30',
    label: 'Poison memory',
  },
};

export function extractTransactionLimit(content: Record<string, unknown>): string | null {
  const v = content.transactionLimit;
  return typeof v === 'string' ? v : v != null ? String(v) : null;
}

export function MemoryCard({
  memoryId,
  content,
  contentHash,
  createdAt,
  credential,
  role,
  walrusObjectId,
  memwalRef,
  suiCredentialRef,
}: {
  memoryId: string;
  content: Record<string, unknown>;
  contentHash?: string;
  createdAt?: string;
  credential?: { status: CredentialStatus; trustScore: number } | null;
  role?: MemoryRole;
  walrusObjectId?: string | null;
  memwalRef?: string | null;
  suiCredentialRef?: string | null;
}) {
  const amount = extractTransactionLimit(content);
  const styles = role ? roleStyles[role] : null;

  return (
    <Card className={cn('space-y-3', styles?.border)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          {role && (
            <span
              className={cn(
                'mb-2 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
                styles!.badge,
              )}
            >
              {styles!.label}
            </span>
          )}
          <CardTitle className="font-mono text-base">{truncateId(memoryId, 10)}</CardTitle>
          {createdAt && <CardDescription>{formatDate(createdAt)}</CardDescription>}
        </div>
        {credential && (
          <TrustBadge status={credential.status} score={credential.trustScore} />
        )}
      </div>

      {amount && (
        <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-5 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500">transactionLimit</p>
          <p
            className={cn(
              'mt-1 text-4xl font-bold tracking-tight',
              role === 'safe' && 'text-emerald-300',
              role === 'poison' && 'text-rose-300',
              !role && 'text-cyan-300',
            )}
          >
            {amount}
          </p>
        </div>
      )}

      <pre className="overflow-x-auto rounded-lg bg-slate-950/80 p-3 font-mono text-xs text-cyan-100/90">
        {JSON.stringify(content, null, 0)}
      </pre>
      {contentHash && (
        <p className="font-mono text-[11px] text-slate-500">hash {truncateId(contentHash, 12)}</p>
      )}
      <ProofLinks
        walrusObjectId={walrusObjectId}
        memwalRef={memwalRef}
        suiCredentialRef={suiCredentialRef}
        compact
      />
    </Card>
  );
}
