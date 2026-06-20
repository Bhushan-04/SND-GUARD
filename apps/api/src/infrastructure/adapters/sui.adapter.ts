import { CredentialStatus } from '@prisma/client';
import { CredentialIssueInput, SuiAdapter } from './types';

export class LocalSuiAdapter implements SuiAdapter {
  async issueCredential(input: CredentialIssueInput): Promise<string> {
    return `sui://credential/${input.memoryId}`;
  }

  async revokeCredential(_suiCredentialRef: string): Promise<string | null> {
    return null;
  }

  async reportPoisonDetected(_memoryId: string, _confidence: number): Promise<string | null> {
    return null;
  }

  async getCredentialStatus(_suiCredentialRef: string): Promise<CredentialStatus> {
    return CredentialStatus.ACTIVE;
  }
}
