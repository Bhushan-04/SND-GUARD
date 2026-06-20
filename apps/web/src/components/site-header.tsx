import Link from 'next/link';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/demo', label: 'Live Demo' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md',
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
            <Shield className="h-5 w-5" aria-hidden />
          </span>
          SNDGuard
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-slate-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
