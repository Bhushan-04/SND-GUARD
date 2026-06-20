'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import type { MemoryListItem, SourceType } from '@snd-guard/shared';
import { TrustBadge } from '@/components/trust-badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { sndGuard } from '@/lib/api';
import { DEFAULT_AGENT, formatDate, truncateId } from '@/lib/utils';

export default function MemoriesPage() {
  const [memories, setMemories] = useState<MemoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setMemories(await sndGuard.listMemories(DEFAULT_AGENT));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await sndGuard.createMemory({
        content: JSON.parse(String(fd.get('content'))),
        sourceAgent: DEFAULT_AGENT,
        creatorAgent: String(fd.get('creatorAgent')),
        sourceType: String(fd.get('sourceType')) as SourceType,
        ingestionPath: 'dashboard/manual',
      });
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Memories</h1>
          <p className="text-slate-400">Registered facts for {DEFAULT_AGENT}</p>
        </div>
        <Button variant="secondary" onClick={() => setOpen((v) => !v)}>
          Register memory
        </Button>
      </div>

      {open && (
        <Card>
          <CardTitle>New memory</CardTitle>
          <form className="mt-4 grid gap-3" onSubmit={onCreate}>
            <textarea
              name="content"
              required
              rows={3}
              defaultValue='{"transactionLimit":"$10K"}'
              className="rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-sm"
            />
            <input
              name="creatorAgent"
              required
              defaultValue={DEFAULT_AGENT}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
            <select
              name="sourceType"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              defaultValue="AGENT"
            >
              <option value="AGENT">AGENT</option>
              <option value="HUMAN">HUMAN</option>
              <option value="EXTERNAL_DOCUMENT">EXTERNAL_DOCUMENT</option>
            </select>
            <Button type="submit">Create</Button>
          </form>
        </Card>
      )}

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Memory</th>
              <th className="px-4 py-3 font-medium">Content</th>
              <th className="px-4 py-3 font-medium">Trust</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : (
              memories.map((m) => (
                <tr key={m.memoryId} className="border-b border-slate-800/80 hover:bg-slate-800/20">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/memories/${m.memoryId}`}
                      className="font-mono text-cyan-300 hover:underline"
                    >
                      {truncateId(m.memoryId)}
                    </Link>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 font-mono text-xs">
                    {JSON.stringify(m.content)}
                  </td>
                  <td className="px-4 py-3">
                    {m.credential && (
                      <TrustBadge status={m.credential.status} score={m.credential.trustScore} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(m.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
