export type CredentialStatus = 'ACTIVE' | 'SUSPICIOUS' | 'REVOKED';
export type SourceType = 'HUMAN' | 'AGENT' | 'EXTERNAL_DOCUMENT';

export interface CreateMemoryInput {
  content: Record<string, unknown> | string;
  sourceAgent: string;
  creatorAgent: string;
  sourceType: SourceType;
  ingestionPath: string;
  contentType?: string;
}

export interface MemoryRegistrationResult {
  memoryId: string;
  contentHash: string;
  content: Record<string, unknown>;
  sourceAgent: string;
  memwalRef?: string;
  walrusObjectId?: string;
  suiCredentialRef?: string;
  credential: {
    credentialId: string;
    trustScore: number;
    status: CredentialStatus;
    issuedAt: string;
  };
  createdAt: string;
}

export interface MemoryListItem {
  memoryId: string;
  content: Record<string, unknown>;
  contentHash: string;
  sourceAgent: string;
  createdAt: string;
  memwalRef?: string | null;
  walrusObjectId?: string | null;
  suiCredentialRef?: string | null;
  credential: {
    trustScore: number;
    status: CredentialStatus;
  } | null;
}

export interface QueryMemoriesResult {
  query: { sourceAgent: string; key?: string };
  consensusValue: unknown;
  memories: Array<{
    memoryId: string;
    value: unknown;
    trustScore: number;
    status: CredentialStatus;
  }>;
  blocked: Array<{
    memoryId: string;
    reason: string;
    trustScore?: number;
    status?: CredentialStatus;
  }>;
}

export interface EvaluateResult {
  memoryId: string;
  confidence: number;
  isPoisoned: boolean;
  explanation: string;
  credential: { trustScore: number; status: CredentialStatus };
}

export interface AuditResult {
  memory: Record<string, unknown>;
  provenance: Array<Record<string, unknown>>;
  credential: Record<string, unknown>;
  trustEvaluations: Array<Record<string, unknown>>;
  counterfactualEvidence: {
    latestResult: string;
    confidence: number | null;
    explanation: string;
    evaluatedAt: string;
  } | null;
}
