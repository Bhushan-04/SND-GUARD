import { Router } from 'express';
import { asyncHandler } from '../../middleware/error.middleware';
import { getValidated, validate } from '../../middleware/validate.middleware';
import { Container } from '../../infrastructure/di/container';
import {
  createMemorySchema,
  CreateMemoryDto,
  createSnapshotSchema,
  CreateSnapshotDto,
  memoryIdParamSchema,
  MemoryIdParam,
  queryMemoriesSchema,
  QueryMemoriesDto,
  restoreSnapshotSchema,
  RestoreSnapshotDto,
} from '../memory/dto/memory.dto';

export function createRoutes(container: Container): Router {
  const router = Router();

  router.post(
    '/memories',
    validate(createMemorySchema),
    asyncHandler(async (req, res) => {
      const body = getValidated<CreateMemoryDto>(res);
      const result = await container.registrationService.registerMemory(body);
      res.status(201).json(result);
    }),
  );

  router.get(
    '/memories/query',
    validate(queryMemoriesSchema, 'query'),
    asyncHandler(async (req, res) => {
      const query = getValidated<QueryMemoriesDto>(res);
      const result = await container.retrievalService.queryMemories(query);
      res.json(result);
    }),
  );

  router.get(
    '/memories/:id',
    validate(memoryIdParamSchema, 'params'),
    asyncHandler(async (req, res) => {
      const { id } = getValidated<MemoryIdParam>(res);
      const memory = await container.memoryService.getMemory(id);
      res.json(memory);
    }),
  );

  router.post(
    '/memories/:id/evaluate',
    validate(memoryIdParamSchema, 'params'),
    asyncHandler(async (req, res) => {
      const { id } = getValidated<MemoryIdParam>(res);
      const result = await container.counterfactualService.evaluate(id);
      res.json(result);
    }),
  );

  router.get(
    '/memories/:id/trust',
    validate(memoryIdParamSchema, 'params'),
    asyncHandler(async (req, res) => {
      const { id } = getValidated<MemoryIdParam>(res);
      const credential = await container.credentialService.getByMemoryId(id);
      res.json(credential);
    }),
  );

  router.get(
    '/memories/:id/evaluations',
    validate(memoryIdParamSchema, 'params'),
    asyncHandler(async (req, res) => {
      const { id } = getValidated<MemoryIdParam>(res);
      const evaluations = await container.trustEvaluationService.getHistory(id);
      res.json({ memoryId: id, evaluations });
    }),
  );

  router.post(
    '/memories/:id/revoke',
    validate(memoryIdParamSchema, 'params'),
    asyncHandler(async (req, res) => {
      const { id } = getValidated<MemoryIdParam>(res);
      const credential = await container.credentialService.revoke(id);
      res.json(credential);
    }),
  );

  router.get(
    '/audit/memory/:id',
    validate(memoryIdParamSchema, 'params'),
    asyncHandler(async (req, res) => {
      const { id } = getValidated<MemoryIdParam>(res);
      const audit = await container.auditService.getFullAudit(id);
      res.json(audit);
    }),
  );

  router.post(
    '/recovery/snapshots',
    validate(createSnapshotSchema),
    asyncHandler(async (req, res) => {
      const body = getValidated<CreateSnapshotDto>(res);
      const snapshot = await container.recoveryService.createSnapshot(body);
      res.status(201).json(snapshot);
    }),
  );

  router.post(
    '/recovery/restore',
    validate(restoreSnapshotSchema),
    asyncHandler(async (req, res) => {
      const body = getValidated<RestoreSnapshotDto>(res);
      const result = await container.recoveryService.restoreFromSnapshot(body);
      res.json(result);
    }),
  );

  return router;
}
