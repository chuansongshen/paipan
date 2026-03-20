import { randomUUID } from 'crypto';
import { createAppError } from '../errors/appError.js';

function buildSummary(text) {
  const normalizedText = text.replace(/\s+/g, ' ').trim();

  if (normalizedText.length <= 120) {
    return normalizedText;
  }

  return `${normalizedText.slice(0, 117)}...`;
}

export function createReportService({
  composeReportPrompt,
  deriveRecommendationTags,
  env,
  genAiClient,
  orderService,
  reportRepository,
}) {
  return {
    async createReport({ currentUserId, mode, question, payload, unlockOrderId }) {
      if (!currentUserId) {
        throw createAppError('[Auth] 当前请求未登录', {
          code: 'AUTH_REQUIRED',
          statusCode: 401
        });
      }

      await orderService.assertReportUnlockAvailable({
        currentUserId,
        orderId: unlockOrderId
      });

      const promptConfig = composeReportPrompt({
        env,
        mode,
        question,
        payload
      });
      const generationResult = await genAiClient.generateText(promptConfig);
      const reportId = `rpt_${randomUUID().replace(/-/g, '')}`;
      const recommendationTags = deriveRecommendationTags?.({
        question,
        content: generationResult.text,
        summary: payload?.summary?.core
      }) || [];
      const reportRecord = {
        id: reportId,
        userId: currentUserId,
        mode,
        question,
        summary: buildSummary(generationResult.text),
        fullReportMarkdown: generationResult.text,
        modelName: generationResult.model || promptConfig.model,
        remainingCredits: 2,
        usageMetadata: generationResult.usageMetadata || null
      };

      if (reportRepository?.insertReport) {
        await reportRepository.insertReport(reportRecord);
      }

      await orderService.consumeReportUnlock({
        currentUserId,
        orderId: unlockOrderId,
        reportId
      });

      return {
        reportId,
        summary: reportRecord.summary,
        reportMarkdown: reportRecord.fullReportMarkdown,
        remainingCredits: reportRecord.remainingCredits,
        usageMetadata: reportRecord.usageMetadata,
        recommendationTags
      };
    }
  };
}
