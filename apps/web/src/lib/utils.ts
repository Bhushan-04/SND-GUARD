import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateId(id: string, len = 8) {
  if (id.length <= len * 2 + 1) return id;
  return `${id.slice(0, len)}…${id.slice(-len)}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export const DEFAULT_AGENT = 'TreasuryAgent';

export const SUI_PACKAGE_ID =
  process.env.NEXT_PUBLIC_SUI_PACKAGE_ID ??
  '0x0000000000000000000000000000000000000000';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
