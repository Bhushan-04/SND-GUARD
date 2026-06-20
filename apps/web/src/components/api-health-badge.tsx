'use client';

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { sndGuard } from '@/lib/api';
import { cn } from '@/lib/utils';

export function ApiHealthBadge({ className }: { className?: string }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'down'>('loading');

  useEffect(() => {
    sndGuard
      .health()
      .then(() => setStatus('ok'))
      .catch(() => setStatus('down'));
  }, []);

  const label =
    status === 'loading' ? 'Checking API…' : status === 'ok' ? 'API online' : 'API offline';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs',
        status === 'ok' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        status === 'down' && 'border-rose-500/30 bg-rose-500/10 text-rose-300',
        status === 'loading' && 'border-slate-700 text-slate-400',
        className,
      )}
    >
      <Activity className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}
