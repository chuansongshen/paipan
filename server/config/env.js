import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().int().positive().default(8787),
  LOG_LEVEL: z.string().default('info'),
  GENAI_BACKEND: z.enum(['studio', 'vertex']).optional(),
  PAYMENT_BACKEND: z.enum(['mock', 'wechat']).optional(),
  GEMINI_API_KEY: z.string().trim().default(''),
  GEMINI_REPORT_MODEL: z.string().trim().default(''),
  GEMINI_FOLLOW_UP_MODEL: z.string().trim().default(''),
  DATABASE_URL: z.string().trim().default(''),
  SESSION_COOKIE_NAME: z.string().trim().default('pai_pan_sid'),
  SESSION_COOKIE_SECRET: z.string().trim().default(''),
  SESSION_COOKIE_SECURE: z.string().trim().default(''),
  WECHAT_APP_ID: z.string().trim().default(''),
  WECHAT_MCH_ID: z.string().trim().default(''),
  WECHAT_NOTIFY_URL: z.string().trim().default(''),
  WECHAT_API_V3_KEY: z.string().trim().default(''),
  WECHAT_MCH_SERIAL_NO: z.string().trim().default(''),
  WECHAT_PRIVATE_KEY: z.string().trim().default(''),
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
  const paymentBackend = parsed.data.PAYMENT_BACKEND || (
    parsed.data.NODE_ENV === 'production' ? 'wechat' : 'mock'
  );

  return {
    nodeEnv: parsed.data.NODE_ENV,
    port: parsed.data.PORT,
    logLevel: parsed.data.LOG_LEVEL,
    genAiBackend,
    paymentBackend,
    geminiApiKey: parsed.data.GEMINI_API_KEY,
    geminiReportModel: parsed.data.GEMINI_REPORT_MODEL,
    geminiFollowUpModel: parsed.data.GEMINI_FOLLOW_UP_MODEL,
    databaseUrl: parsed.data.DATABASE_URL,
    sessionCookieName: parsed.data.SESSION_COOKIE_NAME,
    sessionCookieSecret: parsed.data.SESSION_COOKIE_SECRET || (
      parsed.data.NODE_ENV === 'production'
        ? ''
        : 'development-local-session-secret'
    ),
    sessionCookieSecure: parsed.data.SESSION_COOKIE_SECURE
      ? parsed.data.SESSION_COOKIE_SECURE === 'true'
      : parsed.data.NODE_ENV === 'production',
    wechatAppId: parsed.data.WECHAT_APP_ID,
    wechatMchId: parsed.data.WECHAT_MCH_ID,
    wechatNotifyUrl: parsed.data.WECHAT_NOTIFY_URL,
    wechatApiV3Key: parsed.data.WECHAT_API_V3_KEY,
    wechatMchSerialNo: parsed.data.WECHAT_MCH_SERIAL_NO,
    wechatPrivateKey: parsed.data.WECHAT_PRIVATE_KEY,
    vertexProjectId: parsed.data.VERTEX_PROJECT_ID,
    vertexLocation: parsed.data.VERTEX_LOCATION,
    vertexApiVersion: parsed.data.VERTEX_API_VERSION
  };
}
