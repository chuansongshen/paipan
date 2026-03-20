import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readEnv } from '../config/env.js';
import { createDbPool } from '../db/client.js';

async function main() {
  const env = readEnv();
  const pool = createDbPool(env);
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const migrationPath = join(currentDir, '../db/migrations/001_initial_schema.sql');

  try {
    const sql = await readFile(migrationPath, 'utf8');
    await pool.query(sql);
    console.log('[DB] 迁移执行完成');
  } catch (error) {
    console.error('[DB] 迁移执行失败', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

await main();
