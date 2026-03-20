import cors from 'cors';
import express from 'express';
import { readEnv } from './config/env.js';
import { createLogger } from './config/logger.js';
import { createCurrentUserMiddleware } from './middleware/currentUser.js';
import { registerErrorHandler } from './middleware/errorHandler.js';
import { createRequestContextMiddleware } from './middleware/requestContext.js';
import { registerAuthRoutes } from './routes/authRoutes.js';
import { registerFollowUpRoutes } from './routes/followUpRoutes.js';
import { registerHealthRoutes } from './routes/healthRoutes.js';
import { registerOrderRoutes } from './routes/orderRoutes.js';
import { registerRecommendationRoutes } from './routes/recommendationRoutes.js';
import { registerReportRoutes } from './routes/reportRoutes.js';

export function createApp(options = {}) {
  const app = express();
  const env = options.env || readEnv();
  const logger = options.logger || createLogger(env);
  const services = options.services || {
    reportService: options.reportService,
    orderService: options.orderService,
    followUpService: options.followUpService,
    recommendationService: options.recommendationService
  };

  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(createRequestContextMiddleware({ logger }));
  app.use(createCurrentUserMiddleware({
    authService: services.authService,
    logger
  }));

  app.locals.env = env;
  app.locals.logger = logger;
  app.locals.services = services;

  registerAuthRoutes(app, services);
  registerHealthRoutes(app);
  registerFollowUpRoutes(app, services);
  registerOrderRoutes(app, services);
  registerRecommendationRoutes(app, services);
  registerReportRoutes(app, services);
  registerErrorHandler(app, { logger });

  return app;
}
