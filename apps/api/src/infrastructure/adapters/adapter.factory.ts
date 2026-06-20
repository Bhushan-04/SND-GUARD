import { PrismaClient } from '@prisma/client';
import { getEnv } from '../config/env';
import { LocalMemWalAdapter } from './memwal.adapter';
import { WalrusMemWalAdapter } from './memwal-walrus.adapter';
import { LocalWalrusAdapter } from './walrus.adapter';
import { WalrusHttpAdapter } from './walrus-http.adapter';
import { MemWalAdapter, WalrusAdapter } from './types';

export function createWalrusAdapter(prisma: PrismaClient): WalrusAdapter {
  const env = getEnv();
  if (env.ADAPTER_MODE === 'production') {
    return new WalrusHttpAdapter();
  }
  return new LocalWalrusAdapter(prisma);
}

export function createMemWalAdapter(
  prisma: PrismaClient,
  walrusAdapter: WalrusAdapter,
): MemWalAdapter {
  const env = getEnv();
  if (env.ADAPTER_MODE === 'production' && walrusAdapter instanceof WalrusHttpAdapter) {
    return new WalrusMemWalAdapter(walrusAdapter, prisma);
  }
  return new LocalMemWalAdapter(prisma);
}
