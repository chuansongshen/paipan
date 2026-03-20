import cors from 'cors';
import express from 'express';
import { readEnv } from './config/env.js';
import { createLogger } from './config/logger.js';
import { registerErrorHandler } from './middleware/errorHandler.js';
import { createRequestContextMiddleware } from './middleware/requestContext.js';
import { registerHealthRoutes } from './routes/healthRoutes.js';
import { registerReportRoutes } from './routes/reportRoutes.js';

export function createApp(options = {}) {
  const app = express();
  const env = options.env || readEnv();
  const logger = options.logger || createLogger(env);
  const services = options.services || {
    reportService: options.reportService
  };

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(createRequestContextMiddleware({ logger }));

  app.locals.env = env;
  app.locals.logger = logger;
  app.locals.services = services;

  registerHealthRoutes(app);
  registerReportRoutes(app, services);
  registerErrorHandler(app, { logger });

  return app;
}
