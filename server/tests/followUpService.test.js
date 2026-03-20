import { describe, expect, it, vi } from 'vitest';
import { createFollowUpService } from '../services/followUpService.js';

describe('createFollowUpService', () => {
  it('生成追问回答并扣减次数', async () => {
    const reportRepository = {
      findReportById: vi.fn().mockResolvedValue({
        id: 'rpt_001',
        summary: '事业阶段稳中求进',
        full_report_markdown: '完整报告正文',
        remaining_credits: 2
      }),
      updateRemainingCredits: vi.fn().mockResolvedValue({
        id: 'rpt_001',
        remaining_credits: 1
      })
    };
    const followUpRepository = {
      insertFollowUp: vi.fn().mockResolvedValue(undefined)
    };
    const genAiClient = {
      generateText: vi.fn().mockResolvedValue({
        text: '建议先积累资源，再做岗位切换。',
        usageMetadata: {
          promptTokenCount: 80,
          candidatesTokenCount: 120
        }
      })
    };
    const service = createFollowUpService({
      deriveRecommendationTags: vi.fn().mockReturnValue(['career_anxiety']),
      env: {
        geminiFollowUpModel: 'gemini-3.1-flash-lite-preview'
      },
      followUpRepository,
      genAiClient,
      reportRepository,
    });

    const result = await service.answerQuestion({
      reportId: 'rpt_001',
      userId: 'user_001',
      message: '今年适合换工作吗？'
    });

    expect(reportRepository.findReportById).toHaveBeenCalledWith('rpt_001');
    expect(genAiClient.generateText).toHaveBeenCalledWith({
      model: 'gemini-3.1-flash-lite-preview',
      fallbackModels: ['gemini-3.1-pro-preview', 'gemini-3-flash-preview'],
      prompt: expect.any(String),
      systemInstruction: '请延续原报告的分析语境，给出清晰、简洁、可执行的补充回答。',
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1024
      }
    });
    expect(reportRepository.updateRemainingCredits).toHaveBeenCalledWith('rpt_001', 1);
    expect(followUpRepository.insertFollowUp).toHaveBeenCalledTimes(1);
    expect(result.remainingCredits).toBe(1);
    expect(result.answer).toContain('积累资源');
    expect(result.recommendationTags).toEqual(['career_anxiety']);
  });

  it('在追问次数耗尽时抛出明确错误', async () => {
    const service = createFollowUpService({
      deriveRecommendationTags: vi.fn(),
      env: {},
      followUpRepository: {
        insertFollowUp: vi.fn()
      },
      genAiClient: {
        generateText: vi.fn()
      },
      reportRepository: {
        findReportById: vi.fn().mockResolvedValue({
          id: 'rpt_001',
          summary: '摘要',
          full_report_markdown: '完整报告',
          remaining_credits: 0
        }),
        updateRemainingCredits: vi.fn()
      }
    });

    await expect(
      service.answerQuestion({
        reportId: 'rpt_001',
        message: '还能继续问吗？'
      })
    ).rejects.toThrow('[FollowUp] 追问次数已用尽');
  });
});
