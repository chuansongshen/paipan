import { randomUUID } from 'crypto';

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
  reportRepository,
}) {
  return {
    async createReport({ mode, question, payload }) {
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
        mode,
        question,
        summary: buildSummary(generationResult.text),
        fullReportMarkdown: generationResult.text,
        modelName: promptConfig.model,
        remainingCredits: 2,
        usageMetadata: generationResult.usageMetadata || null
      };

      if (reportRepository?.insertReport) {
        await reportRepository.insertReport(reportRecord);
      }

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
