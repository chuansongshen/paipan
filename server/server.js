import { createApp } from './app.js';

const DEFAULT_PORT = 8787;

function readPort() {
  const port = Number(process.env.PORT || DEFAULT_PORT);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`[Api] 无效端口配置: ${process.env.PORT}`);
  }

  return port;
}

try {
  const app = createApp();
  const port = readPort();

  app.listen(port, () => {
    console.log(`[Api] 服务已启动，端口 ${port}`);
  });
} catch (error) {
  console.error('[Api] 服务启动失败', error);
  process.exitCode = 1;
}
