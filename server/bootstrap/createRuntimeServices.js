import recommendationCatalog from '../config/recommendationCatalog.json' with { type: 'json' };
import { createDbPool } from '../db/client.js';
import { createMemoryRepositories } from '../repositories/memoryRepositories.js';
import { createFollowUpRepository } from '../repositories/followUpRepository.js';
import { createOrderRepository } from '../repositories/orderRepository.js';
import { createReportRepository } from '../repositories/reportRepository.js';
import { composeReportPrompt } from '../services/promptComposer.js';
import { createFollowUpService } from '../services/followUpService.js';
import { createGoogleGenAiClient } from '../services/googleGenAiClient.js';
import { createRecommendationService } from '../services/recommendationService.js';
import { deriveRecommendationTags } from '../services/recommendationTagger.js';
import { createReportService } from '../services/reportService.js';

function buildRepositories({ db, logger }) {
  if (db) {
    logger?.info?.('[Api] 检测到 DATABASE_URL，启用 PostgreSQL 仓储');

    return {
      reportRepository: createReportRepository(db),
      orderRepository: createOrderRepository(db),
      followUpRepository: createFollowUpRepository(db)
    };
  }

  logger?.warn?.('[Api] 未配置 DATABASE_URL，当前使用内存仓储进行联调');
  return createMemoryRepositories({ logger });
}

export function createRuntimeServices({ env, logger }) {
  const db = env.databaseUrl ? createDbPool(env) : null;
  const repositories = buildRepositories({ db, logger });
  const genAiClient = createGoogleGenAiClient({ env, logger });
  const recommendationService = createRecommendationService({
    catalog: recommendationCatalog
  });
  const reportService = createReportService({
    composeReportPrompt,
    env,
    reportRepository: repositories.reportRepository,
    genAiClient,
    deriveRecommendationTags
  });
  const followUpService = createFollowUpService({
    env,
    followUpRepository: repositories.followUpRepository,
    reportRepository: repositories.reportRepository,
    genAiClient,
    deriveRecommendationTags
  });

  logger?.info?.(
    {
      genAiBackend: env.genAiBackend,
      hasDatabase: Boolean(env.databaseUrl)
    },
    '[Api] 服务容器初始化完成'
  );

  return {
    services: {
      reportService,
      followUpService,
      recommendationService
    },
    async close() {
      if (db) {
        await db.end();
        logger?.info?.('[Api] PostgreSQL 连接池已关闭');
      }
    }
  };
}
