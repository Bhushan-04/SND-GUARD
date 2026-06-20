/* eslint-disable @typescript-eslint/no-require-imports */
import { CredentialStatus } from '@prisma/client';
import { getEnv } from '../config/env';
import { CredentialIssueInput, SuiAdapter } from './types';
import { LocalSuiAdapter } from './sui.adapter';

const STATUS_ACTIVE = 0;
const STATUS_SUSPICIOUS = 1;
const STATUS_REVOKED = 2;

function toBytes(value: string): number[] {
  return Array.from(new TextEncoder().encode(value));
}

function loadSuiSdk() {
  const { Ed25519Keypair } = require('@mysten/sui/dist/cjs/keypairs/ed25519');
  const { SuiClient, getFullnodeUrl } = require('@mysten/sui/dist/cjs/client');
  const { Transaction } = require('@mysten/sui/dist/cjs/transactions');
  const { decodeSuiPrivateKey } = require('@mysten/sui/dist/cjs/cryptography/keypair');
  return { Ed25519Keypair, SuiClient, getFullnodeUrl, Transaction, decodeSuiPrivateKey };
}

function loadKeypair(
  sdk: ReturnType<typeof loadSuiSdk>,
  mnemonic?: string,
  secretKey?: string,
) {
  if (secretKey) {
    const { secretKey: bytes } = sdk.decodeSuiPrivateKey(secretKey.trim());
    return sdk.Ed25519Keypair.fromSecretKey(bytes);
  }
  if (mnemonic) {
    return sdk.Ed25519Keypair.deriveKeypair(mnemonic.trim());
  }
  return null;
}

function hasSuiSigner(env: ReturnType<typeof getEnv>): boolean {
  return Boolean(env.SUI_MNEMONIC?.trim() || env.SUI_SECRET_KEY?.trim());
}

/**
 * Uses Sui testnet when ADAPTER_MODE=production and SUI_PACKAGE_ID + SUI_MNEMONIC are set.
 */
export class SuiSdkAdapter implements SuiAdapter {
  private readonly fallback = new LocalSuiAdapter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly client: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly keypair: any;
  private readonly packageId: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly TransactionCtor: any;

  constructor() {
    const env = getEnv();
    this.packageId = env.SUI_PACKAGE_ID;
    const sdk = loadSuiSdk();
    this.TransactionCtor = sdk.Transaction;

    if (env.ADAPTER_MODE === 'production' && hasSuiSigner(env) && env.SUI_PACKAGE_ID) {
      this.keypair = loadKeypair(sdk, env.SUI_MNEMONIC, env.SUI_SECRET_KEY);
      this.client = new sdk.SuiClient({ url: sdk.getFullnodeUrl(env.SUI_NETWORK) });
    } else {
      this.keypair = null;
      this.client = null;
    }
  }

  async issueCredential(input: CredentialIssueInput): Promise<string> {
    if (!this.client || !this.keypair || !this.packageId) {
      return this.fallback.issueCredential(input);
    }

    const tx = new this.TransactionCtor();
    tx.moveCall({
      target: `${this.packageId}::credential::issue_entry`,
      arguments: [
        tx.pure.vector('u8', toBytes(input.memoryId)),
        tx.pure.vector('u8', toBytes(input.contentHash)),
        tx.pure.u64(input.trustScore),
      ],
    });

    const result = await this.client.signAndExecuteTransaction({
      signer: this.keypair,
      transaction: tx,
      options: { showEffects: true, showObjectChanges: true },
    });

    const created = result.objectChanges?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) =>
        c.type === 'created' &&
        String(c.objectType ?? '').includes('::credential::MemoryCredential'),
    );
    if (created?.type === 'created' && created.objectId) {
      return String(created.objectId);
    }

    return result.digest;
  }

  async revokeCredential(suiCredentialRef: string): Promise<string | null> {
    if (!this.client || !this.keypair || !this.packageId) {
      return null;
    }

    if (!suiCredentialRef.startsWith('0x')) {
      return null;
    }

    const tx = new this.TransactionCtor();
    tx.moveCall({
      target: `${this.packageId}::credential::revoke_entry`,
      arguments: [tx.object(suiCredentialRef)],
    });

    const result = await this.client.signAndExecuteTransaction({
      signer: this.keypair,
      transaction: tx,
      options: { showEffects: true },
    });

    return result.digest;
  }

  async emitPoisonDetected(memoryId: string, confidence: number): Promise<string | null> {
    if (!this.client || !this.keypair || !this.packageId) {
      return null;
    }

    const tx = new this.TransactionCtor();
    tx.moveCall({
      target: `${this.packageId}::credential::emit_poison_detected`,
      arguments: [tx.pure.vector('u8', toBytes(memoryId)), tx.pure.u64(confidence)],
    });

    const result = await this.client.signAndExecuteTransaction({
      signer: this.keypair,
      transaction: tx,
      options: { showEffects: true },
    });

    return result.digest;
  }

  async reportPoisonDetected(memoryId: string, confidence: number): Promise<string | null> {
    return this.emitPoisonDetected(memoryId, confidence);
  }

  async getCredentialStatus(suiCredentialRef: string): Promise<CredentialStatus> {
    if (!this.client || !this.packageId || !suiCredentialRef.startsWith('0x')) {
      return this.fallback.getCredentialStatus(suiCredentialRef);
    }

    try {
      const obj = await this.client.getObject({
        id: suiCredentialRef,
        options: { showContent: true },
      });

      const fields = (obj.data?.content as { fields?: { status?: number } } | undefined)?.fields;
      const status = fields?.status ?? STATUS_ACTIVE;

      if (status === STATUS_REVOKED) return CredentialStatus.REVOKED;
      if (status === STATUS_SUSPICIOUS) return CredentialStatus.SUSPICIOUS;
      return CredentialStatus.ACTIVE;
    } catch {
      return CredentialStatus.REVOKED;
    }
  }
}

export function createSuiAdapter(): SuiAdapter {
  const env = getEnv();
  if (env.ADAPTER_MODE === 'production' && env.SUI_PACKAGE_ID && hasSuiSigner(env)) {
    return new SuiSdkAdapter();
  }
  return new LocalSuiAdapter();
}
