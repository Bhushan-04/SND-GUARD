import { SourceType } from '@prisma/client';
import { ConflictError } from '../../shared/errors/app-error';
import { normalizeContent } from '../../shared/utils/content-normalizer';
import { HashService } from '../../infrastructure/hash/hash.service';
import { MemWalAdapter, SuiAdapter, WalrusAdapter } from '../../infrastructure/adapters/types';
import {
  CredentialRepository,
  MemoryRepository,
  ProvenanceRepository,
} from '../memory/memory.repository';

export interface RegisterMemoryInput {
  content: unknown;
  sourceAgent: string;
  creatorAgent: string;
  sourceType: SourceType;
  ingestionPath: string;
  contentType?: string;
}

export class RegistrationService {
  constructor(
    private readonly memoryRepo: MemoryRepository,
    private readonly provenanceRepo: ProvenanceRepository,
    private readonly credentialRepo: CredentialRepository,
    private readonly hashService: HashService,
    private readonly memWalAdapter: MemWalAdapter,
    private readonly walrusAdapter: WalrusAdapter,
    private readonly suiAdapter: SuiAdapter,
  ) {}

  async registerMemory(input: RegisterMemoryInput) {
    const normalizedContent = normalizeContent(input.content);
    const contentHash = this.hashService.hashContent(normalizedContent);

    const existing = await this.memoryRepo.findByContentHash(contentHash);
    if (existing) {
      throw new ConflictError(`Memory with identical content already exists: ${existing.memoryId}`);
    }

    const memory = await this.memoryRepo.create({
      contentHash,
      content: normalizedContent,
      sourceAgent: input.sourceAgent,
      contentType: input.contentType ?? 'application/json',
    });

    await this.provenanceRepo.create({
      memoryId: memory.memoryId,
      creatorAgent: input.creatorAgent,
      sourceType: input.sourceType,
      ingestionPath: input.ingestionPath,
    });

    const memwalRef = await this.memWalAdapter.storeContent(memory.memoryId, normalizedContent);

    const walrusObjectId = await this.walrusAdapter.storeProof(contentHash, {
      memoryId: memory.memoryId,
      contentHash,
      content: normalizedContent,
    });

    const credential = await this.credentialRepo.create(memory.memoryId, 100);

    const suiCredentialRef = await this.suiAdapter.issueCredential({
      memoryId: memory.memoryId,
      contentHash,
      trustScore: 100,
      status: 'ACTIVE',
    });

    await this.memoryRepo.updateAdapterRefs(memory.memoryId, {
      memwalRef,
      walrusObjectId,
      suiCredentialRef,
    });

    return {
      memoryId: memory.memoryId,
      contentHash: memory.contentHash,
      content: normalizedContent,
      sourceAgent: memory.sourceAgent,
      memwalRef,
      walrusObjectId,
      suiCredentialRef,
      credential: {
        credentialId: credential.credentialId,
        trustScore: credential.trustScore,
        status: credential.status,
        issuedAt: credential.issuedAt,
      },
      createdAt: memory.createdAt,
    };
  }
}
