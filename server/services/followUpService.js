import { randomUUID } from 'crypto';
import { createAppError } from '../errors/appError.js';
import { resolveFollowUpModelSelection } from './modelPolicy.js';

function buildFollowUpPrompt({ report, message }) {
  return [
    '你现在基于一份已经生成好的传统命理报告继续回答追问。',
    '回答必须延续原报告口径，避免跳题，避免功效承诺。',
    '',
    `报告摘要：${report.summary}`,
    '',
    '原始报告：',
    report.full_report_markdown,
    '',
    `用户追问：${message}`
  ].join('\n');
}

export function createFollowUpService({
  deriveRecommendationTags,
  env,
  followUpRepository,
  genAiClient,
  reportRepository,
}) {
  const followUpModelSelection = resolveFollowUpModelSelection(env);

  return {
    async answerQuestion({ currentUserId, message, reportId }) {
      if (!currentUserId) {
        throw createAppError('[Auth] 当前请求未登录', {
          code: 'AUTH_REQUIRED',
          statusCode: 401
        });
      }

      const report = await reportRepository.findReportById(reportId);

      if (!report) {
        throw createAppError('[FollowUp] 报告不存在', {
          code: 'REPORT_NOT_FOUND',
          statusCode: 404
        });
      }

      if (report.user_id !== currentUserId) {
        throw createAppError('[FollowUp] 报告不存在', {
          code: 'REPORT_NOT_FOUND',
          statusCode: 404
        });
      }

      if (!report.remaining_credits || report.remaining_credits <= 0) {
        throw createAppError('[FollowUp] 追问次数已用尽', {
          code: 'FOLLOW_UP_CREDITS_EXHAUSTED',
          statusCode: 409
        });
      }

      const generationResult = await genAiClient.generateText({
        model: followUpModelSelection.model,
        fallbackModels: followUpModelSelection.fallbackModels,
        prompt: buildFollowUpPrompt({ report, message }),
        systemInstruction: '请延续原报告的分析语境，给出清晰、简洁、可执行的补充回答。',
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1024
        }
      });
      const remainingCredits = report.remaining_credits - 1;
      const recommendationTags = deriveRecommendationTags?.({
        question: message,
        content: generationResult.text,
        summary: report.summary
      }) || [];

      await reportRepository.updateRemainingCredits(reportId, remainingCredits);

      if (followUpRepository?.insertFollowUp) {
        await followUpRepository.insertFollowUp({
          id: `fu_${randomUUID().replace(/-/g, '')}`,
          reportId,
          userId: currentUserId,
          userMessage: message,
          assistantMessage: generationResult.text,
          remainingCreditsAfter: remainingCredits
        });
      }

      return {
        answer: generationResult.text,
        remainingCredits,
        usageMetadata: generationResult.usageMetadata || null,
        recommendationTags
      };
    }
  };
}
