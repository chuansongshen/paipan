import { z } from 'zod';

const summarySchema = z.object({
  core: z.string().min(1)
});

const payloadSchema = z.object({
  mode: z.string().min(1),
  summary: summarySchema,
  promptText: z.string().min(1),
  meta: z.record(z.string(), z.unknown()).optional(),
  raw: z.unknown().optional()
});

const createReportRequestSchema = z.object({
  unlockOrderId: z.string().trim().min(1),
  mode: z.string().min(1),
  question: z.string().trim().default(''),
  payload: payloadSchema
});

export function parseCreateReportRequest(input) {
  return createReportRequestSchema.parse(input);
}
