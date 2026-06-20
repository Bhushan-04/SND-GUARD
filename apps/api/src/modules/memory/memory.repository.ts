import {
  CredentialStatus,
  EvaluationResult,
  EvaluatorType,
  Prisma,
  PrismaClient,
  SourceType,
} from '@prisma/client';

export interface CreateMemoryInput {
  contentHash: string;
  content: Record<string, unknown>;
  sourceAgent: string;
  contentType: string;
}

export interface CreateProvenanceInput {
  memoryId: string;
  creatorAgent: string;
  sourceType: SourceType;
  ingestionPath: string;
}

export class MemoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateMemoryInput) {
    return this.prisma.memoryAsset.create({
      data: {
        contentHash: data.contentHash,
        content: data.content as Prisma.InputJsonValue,
        sourceAgent: data.sourceAgent,
        contentType: data.contentType,
      },
    });
  }

  async findById(memoryId: string) {
    return this.prisma.memoryAsset.findUnique({ where: { memoryId } });
  }

  async findByContentHash(contentHash: string) {
    return this.prisma.memoryAsset.findUnique({ where: { contentHash } });
  }

  async findRecentBySourceAgent(sourceAgent: string, excludeId: string, limit: number) {
    return this.prisma.memoryAsset.findMany({
      where: {
        sourceAgent,
        memoryId: { not: excludeId },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findBySourceAgent(sourceAgent: string) {
    return this.prisma.memoryAsset.findMany({
      where: { sourceAgent },
      orderBy: { createdAt: 'desc' },
      include: { credential: true },
    });
  }

  async updateAdapterRefs(
    memoryId: string,
    refs: { memwalRef?: string; walrusObjectId?: string; suiCredentialRef?: string },
  ) {
    return this.prisma.memoryAsset.update({
      where: { memoryId },
      data: refs,
    });
  }
}

export class ProvenanceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateProvenanceInput) {
    return this.prisma.provenanceRecord.create({ data });
  }

  async findByMemoryId(memoryId: string) {
    return this.prisma.provenanceRecord.findMany({
      where: { memoryId },
      orderBy: { createdAt: 'asc' },
    });
  }
}

export class CredentialRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(memoryId: string, trustScore = 100) {
    return this.prisma.credential.create({
      data: {
        memoryId,
        trustScore,
        status: CredentialStatus.ACTIVE,
      },
    });
  }

  async findByMemoryId(memoryId: string) {
    return this.prisma.credential.findUnique({ where: { memoryId } });
  }

  async updateTrustAndStatus(memoryId: string, trustScore: number, status: CredentialStatus) {
    return this.prisma.credential.update({
      where: { memoryId },
      data: { trustScore, status },
    });
  }
}

export interface CreateEvaluationInput {
  memoryId: string;
  evaluatorType: EvaluatorType;
  scoreDelta: number;
  result: EvaluationResult;
  reason: string;
  confidence?: number;
}

export class TrustEvaluationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateEvaluationInput) {
    return this.prisma.trustEvaluation.create({ data });
  }

  async findByMemoryId(memoryId: string) {
    return this.prisma.trustEvaluation.findMany({
      where: { memoryId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findLatestCounterfactual(memoryId: string) {
    return this.prisma.trustEvaluation.findFirst({
      where: { memoryId, evaluatorType: EvaluatorType.COUNTERFACTUAL },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export class RecoveryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(reason: string, sourceAgent: string, safeMemorySet: string[]) {
    return this.prisma.recoverySnapshot.create({
      data: {
        reason,
        sourceAgent,
        safeMemorySet: safeMemorySet as Prisma.InputJsonValue,
      },
    });
  }

  async findById(snapshotId: string) {
    return this.prisma.recoverySnapshot.findUnique({ where: { snapshotId } });
  }

  async findLatestBySourceAgent(sourceAgent: string) {
    return this.prisma.recoverySnapshot.findFirst({
      where: { sourceAgent },
      orderBy: { createdAt: 'desc' },
    });
  }
}
