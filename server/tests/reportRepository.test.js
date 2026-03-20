import { describe, expect, it, vi } from 'vitest';
import { createReportRepository } from '../repositories/reportRepository.js';

describe('createReportRepository', () => {
  it('写入报告并返回核心字段', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [
        {
          id: 'rpt_001',
          summary: '摘要',
          remaining_credits: 2
        }
      ]
    });
    const repository = createReportRepository({ query });

    const result = await repository.insertReport({
      id: 'rpt_001',
      userId: 'user_001',
      mode: 'bazi',
      question: '想看事业方向',
      summary: '摘要',
      fullReportMarkdown: '完整报告',
      modelName: 'gemini-2.5-pro',
      remainingCredits: 2,
      usageMetadata: {
        promptTokenCount: 100
      }
    });

    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][1]).toEqual([
      'rpt_001',
      'user_001',
      'bazi',
      '想看事业方向',
      '摘要',
      '完整报告',
      'gemini-2.5-pro',
      2,
      {
        promptTokenCount: 100
      }
    ]);
    expect(result).toEqual({
      id: 'rpt_001',
      summary: '摘要',
      remaining_credits: 2
    });
  });
});
