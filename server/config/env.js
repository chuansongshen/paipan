import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().int().positive().default(8787),
  LOG_LEVEL: z.string().default('info'),
  DATABASE_URL: z.string().trim().default(''),
  VERTEX_PROJECT_ID: z.string().trim().default(''),
  VERTEX_LOCATION: z.string().trim().default('asia-east2'),
  VERTEX_API_VERSION: z.string().trim().default('v1')
});

export function readEnv(source = process.env) {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    throw new Error(`[Api] 环境变量校验失败: ${parsed.error.message}`);
  }

  return {
    nodeEnv: parsed.data.NODE_ENV,
    port: parsed.data.PORT,
    logLevel: parsed.data.LOG_LEVEL,
    databaseUrl: parsed.data.DATABASE_URL,
    vertexProjectId: parsed.data.VERTEX_PROJECT_ID,
    vertexLocation: parsed.data.VERTEX_LOCATION,
    vertexApiVersion: parsed.data.VERTEX_API_VERSION
  };
}
