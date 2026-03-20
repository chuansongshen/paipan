import 'dotenv/config';
import { createApp } from './app.js';
import { createLogger } from './config/logger.js';
import { readEnv } from './config/env.js';
import { createRuntimeServices } from './bootstrap/createRuntimeServices.js';

async function main() {
  const env = readEnv();
  const logger = createLogger(env);
  const runtime = createRuntimeServices({ env, logger });
  const app = createApp({
    env,
    logger,
    services: runtime.services
  });
  const server = app.listen(env.port, () => {
    logger.info(
      {
        port: env.port,
        genAiBackend: env.genAiBackend
      },
      '[Api] 服务已启动'
    );
  });

  const shutdown = async (signal) => {
    logger.info({ signal }, '[Api] 收到退出信号，准备关闭服务');

    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
    await runtime.close();
    logger.info('[Api] 服务已平滑关闭');
  };

  process.once('SIGINT', () => {
    shutdown('SIGINT').catch((error) => {
      logger.error({ err: error }, '[Api] SIGINT 关闭流程失败');
      process.exitCode = 1;
    });
  });

  process.once('SIGTERM', () => {
    shutdown('SIGTERM').catch((error) => {
      logger.error({ err: error }, '[Api] SIGTERM 关闭流程失败');
      process.exitCode = 1;
    });
  });
}

try {
  await main();
} catch (error) {
  console.error('[Api] 服务启动失败', error);
  process.exitCode = 1;
}
