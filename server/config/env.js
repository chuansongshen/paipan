import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().int().positive().default(8787),
  LOG_LEVEL: z.string().default('info'),
  GENAI_BACKEND: z.enum(['studio', 'vertex']).optional(),
  GEMINI_API_KEY: z.string().trim().default(''),
  GEMINI_REPORT_MODEL: z.string().trim().default(''),
  GEMINI_FOLLOW_UP_MODEL: z.string().trim().default(''),
  DATABASE_URL: z.string().trim().default(''),
  WECHAT_APP_ID: z.string().trim().default(''),
  WECHAT_MCH_ID: z.string().trim().default(''),
  WECHAT_NOTIFY_URL: z.string().trim().default(''),
  VERTEX_PROJECT_ID: z.string().trim().default(''),
  VERTEX_LOCATION: z.string().trim().default('asia-east2'),
  VERTEX_API_VERSION: z.string().trim().default('v1')
});

export function readEnv(source = process.env) {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    throw new Error(`[Api] 环境变量校验失败: ${parsed.error.message}`);
  }

  const genAiBackend = parsed.data.GENAI_BACKEND || (
    parsed.data.NODE_ENV === 'production' ? 'vertex' : 'studio'
  );

  return {
    nodeEnv: parsed.data.NODE_ENV,
    port: parsed.data.PORT,
    logLevel: parsed.data.LOG_LEVEL,
    genAiBackend,
    geminiApiKey: parsed.data.GEMINI_API_KEY,
    geminiReportModel: parsed.data.GEMINI_REPORT_MODEL,
    geminiFollowUpModel: parsed.data.GEMINI_FOLLOW_UP_MODEL,
    databaseUrl: parsed.data.DATABASE_URL,
    wechatAppId: parsed.data.WECHAT_APP_ID,
    wechatMchId: parsed.data.WECHAT_MCH_ID,
    wechatNotifyUrl: parsed.data.WECHAT_NOTIFY_URL,
    vertexProjectId: parsed.data.VERTEX_PROJECT_ID,
    vertexLocation: parsed.data.VERTEX_LOCATION,
    vertexApiVersion: parsed.data.VERTEX_API_VERSION
  };
}
