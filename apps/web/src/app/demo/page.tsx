'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { BlockedMemoryList, ConsensusPanel } from '@/components/consensus-panel';
import { DemoProvider, useDemo } from '@/components/demo/demo-provider';
import { MemoryCard } from '@/components/memory-card';
import { TrustBadge } from '@/components/trust-badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { sndGuard } from '@/lib/api';
import { cn } from '@/lib/utils';

const STEPS = [
  { title: 'Create safe memory', desc: 'Register $10K transaction limit from TreasuryAgent' },
  { title: 'Create poison memory', desc: 'Attacker document injects $50K limit' },
  { title: 'Query & detect', desc: 'Consumption gate applies counterfactual consensus' },
  { title: 'Explicit evaluate', desc: 'Run counterfactual on poison memory' },
  { title: 'Trust & evaluations', desc: 'Inspect credential and evaluation history' },
  { title: 'Audit investigation', desc: 'Forensic provenance and evidence' },
  { title: 'Recovery', desc: 'Snapshot safe state and restore agent' },
];

function DemoWizard() {
  const demo = useDemo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trust, setTrust] = useState<Record<string, unknown> | null>(null);
  const [evaluations, setEvaluations] = useState<unknown[] | null>(null);

  const stepHasData = (i: number) => {
    switch (i) {
      case 0:
        return !!demo.safeResult;
      case 1:
        return !!demo.poisonResult;
      case 2:
        return !!demo.queryResult;
      case 3:
        return !!demo.evaluateResult;
      case 4:
        return !!trust;
      case 5:
        return !!demo.auditResult;
      case 6:
        return !!demo.restoreResult;
      default:
        return false;
    }
  };

  const runStep = async () => {
    if (stepHasData(demo.step)) return;

    setLoading(true);
    setError(null);
    try {
      switch (demo.step) {
        case 0: {
          const r = await sndGuard.createMemory({
            content: { transactionLimit: '$10K' },
            sourceAgent: demo.agent,
            creatorAgent: demo.agent,
            sourceType: 'AGENT',
            ingestionPath: 'demo/wizard',
          });
          demo.setSafe(r);
          break;
        }
        case 1: {
          const r = await sndGuard.createMemory({
            content: { transactionLimit: '$50K' },
            sourceAgent: demo.agent,
            creatorAgent: 'AttackerDoc',
            sourceType: 'EXTERNAL_DOCUMENT',
            ingestionPath: 'demo/poison',
          });
          demo.setPoison(r);
          break;
        }
        case 2: {
          const r = await sndGuard.queryMemories(demo.agent, 'transactionLimit');
          demo.setQuery(r);
          break;
        }
        case 3: {
          if (!demo.poisonMemoryId) throw new Error('Poison memory not created');
          const r = await sndGuard.evaluate(demo.poisonMemoryId);
          demo.setEvaluate(r);
          break;
        }
        case 4: {
          if (!demo.poisonMemoryId) throw new Error('Poison memory not created');
          const [t, e] = await Promise.all([
            sndGuard.getTrust(demo.poisonMemoryId),
            sndGuard.getEvaluations(demo.poisonMemoryId),
          ]);
          setTrust(t);
          setEvaluations(e.evaluations);
          break;
        }
        case 5: {
          if (!demo.poisonMemoryId) throw new Error('Poison memory not created');
          const r = await sndGuard.getAudit(demo.poisonMemoryId);
          demo.setAudit(r);
          break;
        }
        case 6: {
          if (!demo.safeMemoryId) throw new Error('Safe memory not created');
          const snap = await sndGuard.createSnapshot({
            reason: 'Demo recovery baseline',
            sourceAgent: demo.agent,
            safeMemoryIds: [demo.safeMemoryId],
          });
          const id = String(snap.snapshotId ?? snap.id ?? '');
          demo.setSnapshot(id);
          const restored = await sndGuard.restore({ sourceAgent: demo.agent, snapshotId: id });
          demo.setRestore(restored);
          break;
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const canNext = demo.step < STEPS.length - 1;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[280px_1fr] lg:px-6">
      <aside>
        <p className="text-sm text-slate-400">
          Step {demo.step + 1} of {STEPS.length}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-100">{STEPS[demo.step].title}</h1>
        <ol className="mt-8 space-y-2" role="list">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <button
                type="button"
                aria-current={i === demo.step ? 'step' : undefined}
                onClick={() => demo.setStep(i)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm transition',
                  'hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50',
                  i === demo.step && 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100',
                  i !== demo.step &&
                    stepHasData(i) &&
                    'border-emerald-500/20 text-emerald-300/80',
                  i !== demo.step &&
                    !stepHasData(i) &&
                    'border-slate-800 text-slate-500',
                )}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 font-mono text-[10px]">
                  {stepHasData(i) ? (
                    <Check className="h-3 w-3" aria-hidden />
                  ) : (
                    i + 1
                  )}
                </span>
                {s.title}
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <div>
        <Card className="backdrop-blur-none">
          <CardTitle>{STEPS[demo.step].title}</CardTitle>
          <CardDescription className="mb-0 block pb-1">
            {STEPS[demo.step].desc}
          </CardDescription>

          <div className="mt-8 space-y-4">
            {stepHasData(demo.step) ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={demo.step}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {demo.step === 0 && demo.safeResult && (
                    <MemoryCard
                      role="safe"
                      memoryId={demo.safeResult.memoryId}
                      content={demo.safeResult.content}
                      createdAt={demo.safeResult.createdAt}
                      credential={demo.safeResult.credential}
                    />
                  )}
                  {demo.step === 1 && demo.poisonResult && (
                    <MemoryCard
                      role="poison"
                      memoryId={demo.poisonResult.memoryId}
                      content={demo.poisonResult.content}
                      createdAt={demo.poisonResult.createdAt}
                      credential={demo.poisonResult.credential}
                    />
                  )}
                  {demo.step === 2 && demo.queryResult && (
                    <>
                      <ConsensusPanel result={demo.queryResult} />
                      <BlockedMemoryList blocked={demo.queryResult.blocked} />
                    </>
                  )}
                  {demo.step === 3 && demo.evaluateResult && (
                    <Card className="border-rose-500/30 bg-rose-500/5">
                      <CardTitle className="text-rose-200">Counterfactual result</CardTitle>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <TrustBadge
                          status={demo.evaluateResult.credential.status}
                          score={demo.evaluateResult.credential.trustScore}
                        />
                        <span className="text-sm text-slate-300">
                          Poisoned: {demo.evaluateResult.isPoisoned ? 'yes' : 'no'} · confidence{' '}
                          {demo.evaluateResult.confidence}%
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-300">
                        {demo.evaluateResult.explanation}
                      </p>
                    </Card>
                  )}
                  {demo.step === 4 && trust && (
                    <Card>
                      <CardTitle>Trust credential</CardTitle>
                      <CardDescription>
                        Poison memory trust dropped to 0 — credential revoked
                      </CardDescription>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border border-slate-800 p-3 text-center">
                          <p className="text-xs text-slate-500">Status</p>
                          <p className="mt-1 font-semibold text-rose-300">
                            {String((trust as { status?: string }).status ?? '—')}
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-800 p-3 text-center">
                          <p className="text-xs text-slate-500">Trust score</p>
                          <p className="mt-1 text-2xl font-bold text-rose-300">
                            {String((trust as { trustScore?: number }).trustScore ?? '—')}
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-800 p-3 text-center">
                          <p className="text-xs text-slate-500">Poison amount</p>
                          <p className="mt-1 text-2xl font-bold text-rose-300">$50K</p>
                        </div>
                      </div>
                      {Array.isArray(evaluations) && evaluations.length > 0 && (
                        <ul className="mt-4 space-y-2">
                          {evaluations.map((ev, i) => {
                            const e = ev as {
                              reason?: string;
                              result?: string;
                              confidence?: number;
                            };
                            return (
                              <li
                                key={i}
                                className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-sm text-rose-100"
                              >
                                {e.reason}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </Card>
                  )}
                  {demo.step === 5 && demo.auditResult && (
                    <Card>
                      <CardTitle>Audit timeline</CardTitle>
                      <p className="mt-2 text-sm text-slate-400">
                        {demo.auditResult.trustEvaluations.length} evaluations ·{' '}
                        {demo.auditResult.provenance.length} provenance records
                      </p>
                      {demo.auditResult.counterfactualEvidence && (
                        <p className="mt-3 text-sm text-rose-200">
                          {demo.auditResult.counterfactualEvidence.explanation}
                        </p>
                      )}
                    </Card>
                  )}
                  {demo.step === 6 && demo.restoreResult && (
                    <Card className="border-emerald-500/30">
                      <CardTitle className="text-emerald-300">Recovery complete</CardTitle>
                      <CardDescription>Snapshot {demo.snapshotId}</CardDescription>
                      <pre className="mt-4 overflow-x-auto font-mono text-xs text-slate-300">
                        {JSON.stringify(demo.restoreResult, null, 2)}
                      </pre>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div
                role="status"
                className="rounded-lg border border-dashed border-slate-600 bg-slate-950/40 px-4 py-10 text-center text-sm leading-relaxed text-slate-500"
              >
                No results yet — click <strong className="text-slate-300">Run step</strong> to
                execute this stage, or use the sidebar to revisit completed steps.
              </div>
            )}

            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              disabled={demo.step === 0 || loading}
              onClick={() => demo.setStep(demo.step - 1)}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Back
            </Button>
            <Button disabled={loading || stepHasData(demo.step)} onClick={runStep}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Running…
                </>
              ) : stepHasData(demo.step) ? (
                'Step complete'
              ) : (
                'Run step'
              )}
            </Button>
            <Button
              variant="ghost"
              disabled={!canNext || loading}
              onClick={() => demo.setStep(demo.step + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              className="ml-auto"
              onClick={() => {
                demo.reset();
                setTrust(null);
                setEvaluations(null);
                setError(null);
              }}
            >
              Reset demo
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <DemoProvider>
      <DemoWizard />
    </DemoProvider>
  );
}
