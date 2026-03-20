import { describe, expect, it, vi } from 'vitest';
import { createReportService } from '../services/reportService.js';

describe('createReportService', () => {
  it('创建完整报告并持久化', async () => {
    const composeReportPrompt = vi.fn().mockReturnValue({
      model: 'gemini-3.1-flash-lite-preview',
      fallbackModels: ['gemini-3.1-pro-preview', 'gemini-3-flash-preview'],
      prompt: 'prompt body',
      systemInstruction: 'system instruction'
    });
    const genAiClient = {
      generateText: vi.fn().mockResolvedValue({
        text: '事业方向稳中有进，建议先积累资源再求变。',
        model: 'gemini-3.1-flash-lite-preview',
        usageMetadata: {
          promptTokenCount: 120,
          candidatesTokenCount: 260
        }
      })
    };
    const reportRepository = {
      insertReport: vi.fn().mockResolvedValue(undefined)
    };
    const service = createReportService({
      composeReportPrompt,
      deriveRecommendationTags: vi.fn().mockReturnValue(['career_anxiety']),
      env: {
        genAiBackend: 'studio'
      },
      genAiClient,
      reportRepository,
    });

    const result = await service.createReport({
      mode: 'bazi',
      question: '想看事业方向',
      payload: {
        summary: {
          core: '甲子 乙丑 丙寅 丁卯，日主 丙'
        },
        promptText: '完整排盘内容'
      }
    });

    expect(composeReportPrompt).toHaveBeenCalledTimes(1);
    expect(genAiClient.generateText).toHaveBeenCalledWith({
      model: 'gemini-3.1-flash-lite-preview',
      fallbackModels: ['gemini-3.1-pro-preview', 'gemini-3-flash-preview'],
      prompt: 'prompt body',
      systemInstruction: 'system instruction'
    });
    expect(reportRepository.insertReport).toHaveBeenCalledTimes(1);
    expect(result.reportId).toMatch(/^rpt_/);
    expect(result.reportMarkdown).toContain('事业方向');
    expect(result.remainingCredits).toBe(2);
    expect(result.recommendationTags).toEqual(['career_anxiety']);
  });
});
