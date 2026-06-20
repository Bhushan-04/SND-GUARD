'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { CredentialStatus } from '@snd-guard/shared';
import { TrustBadge } from '@/components/trust-badge';
import { Button } from '@/components/ui/button';
import { ProofLinks } from '@/components/proof-links';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { sndGuard } from '@/lib/api';

export default function MemoryDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [memory, setMemory] = useState<Record<string, unknown> | null>(null);
  const [trust, setTrust] = useState<Record<string, unknown> | null>(null);
  const [evaluations, setEvaluations] = useState<unknown[]>([]);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([sndGuard.getMemory(id), sndGuard.getTrust(id), sndGuard.getEvaluations(id)])
      .then(([m, t, e]) => {
        setMemory(m);
        setTrust(t);
        setEvaluations(e.evaluations);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, [id]);

  const runEvaluate = async () => {
    if (!id) return;
    try {
      const r = await sndGuard.evaluate(id);
      setActionMsg(`Evaluate: poisoned=${r.isPoisoned}, confidence=${r.confidence}`);
      const t = await sndGuard.getTrust(id);
      setTrust(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Evaluate failed');
    }
  };

  const runRevoke = async () => {
    if (!id) return;
    try {
      await sndGuard.revoke(id);
      setActionMsg('Memory credential revoked');
      setTrust(await sndGuard.getTrust(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Revoke failed');
    }
  };

  const credential = trust?.credential as { status: CredentialStatus; trustScore: number } | undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-lg text-slate-100">{id}</h1>
        {credential && <TrustBadge status={credential.status} score={credential.trustScore} />}
      </div>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}
      {actionMsg && <p className="text-sm text-emerald-300">{actionMsg}</p>}

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={runEvaluate}>
          Evaluate
        </Button>
        <Button variant="danger" onClick={runRevoke}>
          Revoke
        </Button>
        <Link href={`/dashboard/audit/${id}`}>
          <Button variant="ghost">View audit</Button>
        </Link>
      </div>

      <Card>
        <CardTitle>Overview</CardTitle>
        <div className="mt-3">
          <ProofLinks
            walrusObjectId={memory?.walrusObjectId as string | undefined}
            memwalRef={memory?.memwalRef as string | undefined}
            suiCredentialRef={memory?.suiCredentialRef as string | undefined}
          />
        </div>
        <pre className="mt-4 overflow-x-auto font-mono text-xs text-slate-300">
          {JSON.stringify(memory, null, 2)}
        </pre>
      </Card>

      <Card>
        <CardTitle>Trust</CardTitle>
        <CardDescription>{evaluations.length} evaluations (append-only)</CardDescription>
        <pre className="mt-4 overflow-x-auto font-mono text-xs text-slate-300">
          {JSON.stringify({ trust, evaluations }, null, 2)}
        </pre>
      </Card>
    </div>
  );
}
