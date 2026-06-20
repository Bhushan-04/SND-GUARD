import type { CredentialStatus } from '@snd-guard/shared';
import { cn } from '@/lib/utils';

const styles: Record<CredentialStatus, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  SUSPICIOUS: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  REVOKED: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

export function TrustBadge({
  status,
  score,
  className,
}: {
  status: CredentialStatus;
  score?: number;
  className?: string;
}) {
  return (
    <span
      aria-label={`Trust status ${status}${score != null ? `, score ${score}` : ''}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide',
        styles[status],
        className,
      )}
    >
      {status}
      {score != null && <span className="font-mono normal-case text-[11px]">{score}</span>}
    </span>
  );
}
