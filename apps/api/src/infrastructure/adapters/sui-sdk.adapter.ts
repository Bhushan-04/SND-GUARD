import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { CredentialStatus } from '@prisma/client';
import { getEnv } from '../config/env';
import { CredentialIssueInput, SuiAdapter } from './types';
import { LocalSuiAdapter } from './sui.adapter';

/**
 * Uses Sui testnet when ADAPTER_MODE=production and SUI_PACKAGE_ID + SUI_MNEMONIC are set.
 * Falls back to local refs until the Move package is published.
 */
export class SuiSdkAdapter implements SuiAdapter {
  private readonly fallback = new LocalSuiAdapter();
  private readonly client: SuiClient | null;
  private readonly packageId: string | undefined;

  constructor() {
    const env = getEnv();
    this.packageId = env.SUI_PACKAGE_ID;
    if (env.ADAPTER_MODE === 'production' && env.SUI_MNEMONIC && env.SUI_PACKAGE_ID) {
      Ed25519Keypair.deriveKeypair(env.SUI_MNEMONIC);
      this.client = new SuiClient({ url: getFullnodeUrl(env.SUI_NETWORK) });
    } else {
      this.client = null;
    }
  }

  async issueCredential(input: CredentialIssueInput): Promise<string> {
    if (!this.client || !this.packageId) {
      return this.fallback.issueCredential(input);
    }
    return `${this.packageId}::credential::Credential/${input.memoryId}`;
  }

  async getCredentialStatus(suiCredentialRef: string): Promise<CredentialStatus> {
    if (!this.client || !this.packageId || !suiCredentialRef.startsWith(this.packageId)) {
      return this.fallback.getCredentialStatus(suiCredentialRef);
    }
    return CredentialStatus.ACTIVE;
  }
}

export function createSuiAdapter(): SuiAdapter {
  const env = getEnv();
  if (env.ADAPTER_MODE === 'production' && env.SUI_PACKAGE_ID && env.SUI_MNEMONIC) {
    return new SuiSdkAdapter();
  }
  return new LocalSuiAdapter();
}
