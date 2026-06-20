import { prisma } from '../../database/prisma.client';
import { HashService } from '../hash/hash.service';
import { LocalMemWalAdapter } from '../adapters/memwal.adapter';
import { LocalWalrusAdapter } from '../adapters/walrus.adapter';
import { createSuiAdapter } from '../adapters/sui-sdk.adapter';
import {
  CredentialRepository,
  MemoryRepository,
  ProvenanceRepository,
  RecoveryRepository,
  TrustEvaluationRepository,
} from '../../modules/memory/memory.repository';
import { MemoryService } from '../../modules/memory/memory.service';
import { CredentialService } from '../../modules/credential/credential.service';
import { TrustEvaluationService } from '../../modules/trust-evaluation/trust-evaluation.service';
import { IntegrityService } from '../../modules/integrity/integrity.service';
import { CounterfactualService } from '../../modules/counterfactual/counterfactual.service';
import { RegistrationService } from '../../modules/registration/registration.service';
import { RetrievalService } from '../../modules/retrieval/retrieval.service';
import { AuditService } from '../../modules/audit/audit.service';
import { RecoveryService } from '../../modules/recovery/recovery.service';

export class Container {
  readonly hashService = new HashService();

  readonly memoryRepo = new MemoryRepository(prisma);
  readonly provenanceRepo = new ProvenanceRepository(prisma);
  readonly credentialRepo = new CredentialRepository(prisma);
  readonly trustEvaluationRepo = new TrustEvaluationRepository(prisma);
  readonly recoveryRepo = new RecoveryRepository(prisma);

  readonly memWalAdapter = new LocalMemWalAdapter(prisma);
  readonly walrusAdapter = new LocalWalrusAdapter(prisma);
  readonly suiAdapter = createSuiAdapter();

  readonly memoryService = new MemoryService(this.memoryRepo);
  readonly credentialService = new CredentialService(this.credentialRepo);
  readonly trustEvaluationService = new TrustEvaluationService(this.trustEvaluationRepo);

  readonly integrityService = new IntegrityService(
    this.memoryRepo,
    this.hashService,
    this.walrusAdapter,
    this.credentialService,
    this.trustEvaluationService,
  );

  readonly counterfactualService = new CounterfactualService(
    this.memoryService,
    this.credentialService,
    this.trustEvaluationService,
  );

  readonly registrationService = new RegistrationService(
    this.memoryRepo,
    this.provenanceRepo,
    this.credentialRepo,
    this.hashService,
    this.memWalAdapter,
    this.walrusAdapter,
    this.suiAdapter,
  );

  readonly retrievalService = new RetrievalService(
    this.memWalAdapter,
    this.integrityService,
    this.credentialService,
    this.counterfactualService,
    this.trustEvaluationService,
  );

  readonly auditService = new AuditService(
    this.memoryService,
    this.provenanceRepo,
    this.credentialService,
    this.trustEvaluationService,
  );

  readonly recoveryService = new RecoveryService(
    this.recoveryRepo,
    this.memoryService,
    this.memWalAdapter,
  );
}

export function createContainer(): Container {
  return new Container();
}
