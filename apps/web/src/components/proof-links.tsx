import { ExternalLink } from 'lucide-react';
import { suiObjectUrl, truncateRef, walrusBlobUrl } from '@/lib/explorer-links';

interface ProofLinksProps {
  walrusObjectId?: string | null;
  memwalRef?: string | null;
  suiCredentialRef?: string | null;
  compact?: boolean;
}

export function ProofLinks({
  walrusObjectId,
  memwalRef,
  suiCredentialRef,
  compact = false,
}: ProofLinksProps) {
  const walrusId = walrusObjectId ?? (memwalRef?.startsWith('walrus://') ? memwalRef.slice(9) : null);
  const walrusUrl = walrusBlobUrl(walrusId);
  const suiUrl = suiObjectUrl(suiCredentialRef);

  if (!walrusUrl && !suiUrl && !memwalRef) {
    return <span className="text-xs text-slate-500">No on-chain proofs yet</span>;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      {walrusUrl && (
        <a
          href={walrusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 font-mono text-cyan-200 hover:bg-cyan-500/20"
        >
          Walrus {truncateRef(walrusId ?? '')}
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      )}
      {suiUrl && (
        <a
          href={suiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-1 font-mono text-violet-200 hover:bg-violet-500/20"
        >
          Sui credential {truncateRef(suiCredentialRef ?? '')}
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      )}
      {memwalRef && !walrusUrl && (
        <span className="font-mono text-slate-400">{truncateRef(memwalRef)}</span>
      )}
    </div>
  );
}
