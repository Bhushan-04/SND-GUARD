import Link from 'next/link';
import { ArrowRight, Blocks, Lock, ShieldCheck, Workflow } from 'lucide-react';
import { ApiHealthBadge } from '@/components/api-health-badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { SUI_PACKAGE_ID } from '@/lib/utils';

const lifecycle = [
  'Register memory',
  'Ingest (non-blocking)',
  'Query gate',
  'Counterfactual check',
  'Trust evaluation',
  'Audit trail',
  'Recovery snapshot',
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-cyan-400">
            Agentic Web · Sui Overflow 2026
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
            Stop poisoned memories before agents act
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
            SNDGuard sits between AI agents and memory stores. Ingest never blocks — consumption
            is gated by counterfactual consensus, trust credentials, and forensic audit trails.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/demo">
              <Button>
                Run live demo
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary">Open dashboard</Button>
            </Link>
          </div>
        </div>
        <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-900 to-slate-950">
          <CardTitle>TreasuryAgent scenario</CardTitle>
          <CardDescription>Semantic Norm Drift in one glance</CardDescription>
          <div className="mt-6 space-y-3 font-mono text-sm">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-200">
              Safe: {'{ "transactionLimit": "$10K" }'}
            </div>
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200">
              Poison: {'{ "transactionLimit": "$50K" }'}
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Query consensus returns $10K. The poison memory is blocked and auto-revoked.
          </p>
        </Card>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: 'Non-blocking ingest',
            body: 'Poison enters as ACTIVE/100. Detection happens at consumption time — where it matters.',
          },
          {
            icon: Workflow,
            title: 'Counterfactual consensus',
            body: 'Conflicting JSON facts are compared across an agent’s memory graph with oldest-memory tie-break.',
          },
          {
            icon: Lock,
            title: 'Trust credentials',
            body: 'Mutable credentials track ACTIVE → SUSPICIOUS → REVOKED with append-only evaluations.',
          },
        ].map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <Icon className="h-6 w-6 text-cyan-400" aria-hidden />
            <CardTitle className="mt-4">{title}</CardTitle>
            <CardDescription className="leading-relaxed">{body}</CardDescription>
          </Card>
        ))}
      </section>

      <section className="mt-20">
        <h2 className="text-2xl font-semibold text-slate-100">Why Sui + Walrus</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <Blocks className="h-6 w-6 text-cyan-400" aria-hidden />
            <CardTitle className="mt-4">On-chain trust credentials</CardTitle>
            <CardDescription className="leading-relaxed">
              Move package issues credential objects tied to memory hashes. Package ID is verifiable
              on Sui testnet explorer.
            </CardDescription>
            <p className="mt-4 break-all font-mono text-xs text-slate-500">{SUI_PACKAGE_ID}</p>
          </Card>
          <Card>
            <CardTitle className="mt-2">Walrus integrity proofs</CardTitle>
            <CardDescription className="leading-relaxed">
              Memory content is stored off-chain with hash-linked proofs. SNDGuard verifies before
              agents consume facts.
            </CardDescription>
          </Card>
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-2xl font-semibold text-slate-100">7-step lifecycle</h2>
        <ol className="mt-6 flex flex-wrap gap-3">
          {lifecycle.map((step, i) => (
            <li
              key={step}
              className="rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm text-slate-300"
            >
              <span className="mr-2 font-mono text-cyan-400">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div>
          <p className="text-sm text-slate-400">Production stack</p>
          <p className="mt-1 text-slate-200">Express API · Supabase · Sui testnet · Walrus</p>
        </div>
        <ApiHealthBadge />
      </section>

      <footer className="mt-16 border-t border-slate-800 pt-8 text-sm text-slate-500">
        <p>SNDGuard — AI Memory Security Middleware · Track: Agentic Web</p>
        <p className="mt-2 font-mono text-xs">Package {SUI_PACKAGE_ID}</p>
      </footer>
    </div>
  );
}
