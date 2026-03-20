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
    const vertexAiClient = {
      generateText: vi.fn().mockResolvedValue({
        text: '建议先积累资源，再做岗位切换。',
        usageMetadata: {
          promptTokenCount: 80,
          candidatesTokenCount: 120
        }
      })
    };
    const service = createFollowUpService({
      followUpRepository,
      reportRepository,
      vertexAiClient
    });

    const result = await service.answerQuestion({
      reportId: 'rpt_001',
      userId: 'user_001',
      message: '今年适合换工作吗？'
    });

    expect(reportRepository.findReportById).toHaveBeenCalledWith('rpt_001');
    expect(vertexAiClient.generateText).toHaveBeenCalledTimes(1);
    expect(reportRepository.updateRemainingCredits).toHaveBeenCalledWith('rpt_001', 1);
    expect(followUpRepository.insertFollowUp).toHaveBeenCalledTimes(1);
    expect(result.remainingCredits).toBe(1);
    expect(result.answer).toContain('积累资源');
  });

  it('在追问次数耗尽时抛出明确错误', async () => {
    const service = createFollowUpService({
      followUpRepository: {
        insertFollowUp: vi.fn()
      },
      reportRepository: {
        findReportById: vi.fn().mockResolvedValue({
          id: 'rpt_001',
          summary: '摘要',
          full_report_markdown: '完整报告',
          remaining_credits: 0
        }),
        updateRemainingCredits: vi.fn()
      },
      vertexAiClient: {
        generateText: vi.fn()
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
