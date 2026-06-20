'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { MemoryListItem } from '@snd-guard/shared';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { sndGuard } from '@/lib/api';
import { DEFAULT_AGENT } from '@/lib/utils';

export default function RecoveryPage() {
  const [memories, setMemories] = useState<MemoryListItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    sndGuard.listMemories(DEFAULT_AGENT).then(setMemories).catch(() => {});
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onSnapshot = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const reason = String(new FormData(e.currentTarget).get('reason') || 'Manual snapshot');
    try {
      const snap = await sndGuard.createSnapshot({
        reason,
        sourceAgent: DEFAULT_AGENT,
        safeMemoryIds: selected,
      });
      setResult(snap);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Snapshot failed');
    }
  };

  const onRestore = async () => {
    const snapshotId = result?.snapshotId ? String(result.snapshotId) : undefined;
    try {
      setResult(await sndGuard.restore({ sourceAgent: DEFAULT_AGENT, snapshotId }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restore failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Recovery</h1>
        <p className="text-slate-400">Snapshot safe memories and restore agent state</p>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      <Card>
        <CardTitle>Select safe memories</CardTitle>
        <ul className="mt-4 space-y-2">
          {memories.map((m) => (
            <li key={m.memoryId}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 px-3 py-2 hover:bg-slate-800/30">
                <input
                  type="checkbox"
                  checked={selected.includes(m.memoryId)}
                  onChange={() => toggle(m.memoryId)}
                />
                <span className="font-mono text-xs text-slate-400">{m.memoryId}</span>
                <span className="truncate font-mono text-xs">{JSON.stringify(m.content)}</span>
              </label>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle>Create snapshot</CardTitle>
        <form className="mt-4 flex flex-wrap gap-3" onSubmit={onSnapshot}>
          <input
            name="reason"
            defaultValue="Dashboard recovery baseline"
            className="min-w-[240px] flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
          <Button type="submit" disabled={selected.length === 0}>
            Create snapshot
          </Button>
        </form>
        {result && (
          <div className="mt-4">
            <Button variant="secondary" onClick={onRestore}>
              Restore from last snapshot
            </Button>
            <pre className="mt-4 overflow-x-auto font-mono text-xs text-slate-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
}
