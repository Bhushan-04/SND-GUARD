export interface MemoryQuery {
  sourceAgent: string;
  key?: string;
}

export interface MemWalCandidate {
  memoryId: string;
  content: Record<string, unknown>;
  memwalRef: string;
}

export interface MemWalAdapter {
  storeContent(memoryId: string, content: Record<string, unknown>): Promise<string>;
  fetchCandidates(query: MemoryQuery): Promise<MemWalCandidate[]>;
  restoreSafeSet(sourceAgent: string, memoryIds: string[]): Promise<void>;
}

export interface ProofPayload {
  memoryId: string;
  contentHash: string;
  content?: Record<string, unknown>;
}

export interface WalrusAdapter {
  storeProof(contentHash: string, payload: ProofPayload): Promise<string>;
  verifyProof(walrusObjectId: string, contentHash: string): Promise<boolean>;
}

export interface CredentialIssueInput {
  memoryId: string;
  contentHash: string;
  trustScore: number;
  status: 'ACTIVE' | 'SUSPICIOUS' | 'REVOKED';
}

export interface CredentialIssueResult {
  objectId: string;
  txDigest?: string;
}

export interface SuiAdapter {
  issueCredential(input: CredentialIssueInput): Promise<string>;
  revokeCredential(suiCredentialRef: string): Promise<string | null>;
  getCredentialStatus(suiCredentialRef: string): Promise<'ACTIVE' | 'SUSPICIOUS' | 'REVOKED'>;
  reportPoisonDetected(memoryId: string, confidence: number): Promise<string | null>;
}
