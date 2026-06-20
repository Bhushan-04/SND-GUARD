'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Database,
  LayoutDashboard,
  RotateCcw,
  Search,
  Shield,
} from 'lucide-react';
import { ApiHealthBadge } from '@/components/api-health-badge';
import { cn, DEFAULT_AGENT } from '@/lib/utils';

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/memories', label: 'Memories', icon: Database },
  { href: '/dashboard/query', label: 'Query', icon: Search },
  { href: '/dashboard/recovery', label: 'Recovery', icon: RotateCcw },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl">
      <aside className="hidden w-56 shrink-0 border-r border-slate-800 p-4 md:block">
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <Shield className="h-4 w-4 text-cyan-400" aria-hidden />
          {DEFAULT_AGENT}
        </div>
        <nav className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
                pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                  ? 'bg-cyan-500/10 text-cyan-200'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 sm:px-6">
          <p className="text-sm text-slate-400">Operations dashboard</p>
          <ApiHealthBadge />
        </div>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
