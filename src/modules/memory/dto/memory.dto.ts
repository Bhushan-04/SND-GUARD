import { z } from 'zod';

export const createMemorySchema = z.object({
  content: z.union([z.record(z.unknown()), z.string().min(1)]),
  sourceAgent: z.string().min(1),
  creatorAgent: z.string().min(1),
  sourceType: z.enum(['HUMAN', 'AGENT', 'EXTERNAL_DOCUMENT']),
  ingestionPath: z.string().min(1),
  contentType: z.string().optional(),
});

export const memoryIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const queryMemoriesSchema = z.object({
  sourceAgent: z.string().min(1),
  key: z.string().optional(),
});

export const createSnapshotSchema = z.object({
  reason: z.string().min(1),
  sourceAgent: z.string().min(1),
  safeMemoryIds: z.array(z.string().uuid()).min(1),
});

export const restoreSnapshotSchema = z.object({
  snapshotId: z.string().uuid().optional(),
  sourceAgent: z.string().min(1),
});

export type CreateMemoryDto = z.infer<typeof createMemorySchema>;
export type MemoryIdParam = z.infer<typeof memoryIdParamSchema>;
export type QueryMemoriesDto = z.infer<typeof queryMemoriesSchema>;
export type CreateSnapshotDto = z.infer<typeof createSnapshotSchema>;
export type RestoreSnapshotDto = z.infer<typeof restoreSnapshotSchema>;
