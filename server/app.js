import cors from 'cors';
import express from 'express';
import { readEnv } from './config/env.js';
import { createLogger } from './config/logger.js';
import { registerErrorHandler } from './middleware/errorHandler.js';
import { createRequestContextMiddleware } from './middleware/requestContext.js';
import { registerHealthRoutes } from './routes/healthRoutes.js';

export function createApp(options = {}) {
  const app = express();
  const env = options.env || readEnv();
  const logger = options.logger || createLogger(env);

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(createRequestContextMiddleware({ logger }));

  app.locals.env = env;
  app.locals.logger = logger;

  registerHealthRoutes(app);
  registerErrorHandler(app, { logger });

  return app;
}
