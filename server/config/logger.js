import pino from 'pino';

export function createLogger(env) {
  return pino({
    name: 'paipan-api',
    level: env.logLevel || 'info'
  });
}
