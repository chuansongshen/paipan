import { randomUUID } from 'crypto';

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
  followUpRepository,
  genAiClient,
  reportRepository,
}) {
  return {
    async answerQuestion({ message, reportId, userId }) {
      const report = await reportRepository.findReportById(reportId);

      if (!report) {
        throw new Error('[FollowUp] 报告不存在');
      }

      if (!report.remaining_credits || report.remaining_credits <= 0) {
        throw new Error('[FollowUp] 追问次数已用尽');
      }

      const generationResult = await genAiClient.generateText({
        model: 'gemini-2.5-flash',
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
          userId,
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
