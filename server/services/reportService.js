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
  reportRepository,
  vertexAiClient
}) {
  return {
    async createReport({ mode, question, payload }) {
      const promptConfig = composeReportPrompt({
        mode,
        question,
        payload
      });
      const generationResult = await vertexAiClient.generateText(promptConfig);
      const reportId = `rpt_${randomUUID().replace(/-/g, '')}`;
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
        usageMetadata: reportRecord.usageMetadata
      };
    }
  };
}
