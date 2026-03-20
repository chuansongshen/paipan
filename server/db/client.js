import { Pool } from 'pg';

export function createDbPool(env) {
  if (!env.databaseUrl) {
    throw new Error('[DB] 缺少 DATABASE_URL 配置');
  }

  return new Pool({
    connectionString: env.databaseUrl
  });
}
