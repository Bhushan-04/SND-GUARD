'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { AuditResult } from '@snd-guard/shared';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { sndGuard } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function AuditPage() {
  const params = useParams<{ id: string }>();
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    sndGuard
      .getAudit(params.id)
      .then(setAudit)
      .catch((e) => setError(e instanceof Error ? e.message : 'Audit failed'));
  }, [params.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit</h1>
        <p className="font-mono text-sm text-slate-400">{params.id}</p>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      {audit && (
        <>
          <Card>
            <CardTitle>Counterfactual evidence</CardTitle>
            {audit.counterfactualEvidence ? (
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-rose-200">{audit.counterfactualEvidence.explanation}</p>
                <p className="text-slate-400">
                  Result: {audit.counterfactualEvidence.latestResult} · confidence{' '}
                  {audit.counterfactualEvidence.confidence ?? '—'}
                </p>
                <p className="text-slate-500">{formatDate(audit.counterfactualEvidence.evaluatedAt)}</p>
              </div>
            ) : (
              <CardDescription className="mt-2">No counterfactual evidence recorded</CardDescription>
            )}
          </Card>

          <Card>
            <CardTitle>Provenance ({audit.provenance.length})</CardTitle>
            <ul className="mt-4 space-y-2">
              {audit.provenance.map((p, i) => (
                <li key={i} className="rounded-lg bg-slate-950/60 p-3 font-mono text-xs text-slate-400">
                  {JSON.stringify(p)}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardTitle>Trust evaluations ({audit.trustEvaluations.length})</CardTitle>
            <ul className="mt-4 space-y-2">
              {audit.trustEvaluations.map((ev, i) => (
                <li key={i} className="rounded-lg bg-slate-950/60 p-3 font-mono text-xs text-slate-400">
                  {JSON.stringify(ev)}
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
