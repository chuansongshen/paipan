import { readdir, readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readEnv } from '../config/env.js';
import { createDbPool } from '../db/client.js';

async function main() {
  const env = readEnv();
  const pool = createDbPool(env);
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const migrationDirectory = join(currentDir, '../db/migrations');

  try {
    const files = (await readdir(migrationDirectory))
      .filter((fileName) => fileName.endsWith('.sql'))
      .sort();

    for (const fileName of files) {
      const sql = await readFile(join(migrationDirectory, fileName), 'utf8');

      await pool.query(sql);
      console.log(`[DB] 已执行迁移 ${fileName}`);
    }

    console.log('[DB] 迁移执行完成');
  } catch (error) {
    console.error('[DB] 迁移执行失败', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

await main();
