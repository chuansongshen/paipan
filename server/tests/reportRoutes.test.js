import { describe, expect, it, vi } from 'vitest';
import { createReportHandler } from '../routes/reportRoutes.js';

function createMockResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    }
  };
}

describe('createReportHandler', () => {
  it('校验入参并返回报告响应', async () => {
    const reportService = {
      createReport: vi.fn().mockResolvedValue({
        reportId: 'rpt_001',
        summary: '摘要',
        reportMarkdown: '报告正文',
        remainingCredits: 2,
        usageMetadata: null,
        recommendationTags: ['career_anxiety']
      })
    };
    const next = vi.fn();
    const response = createMockResponse();
    const handler = createReportHandler({ reportService });

    await handler(
      {
        body: {
          mode: 'bazi',
          question: '想看事业方向',
          payload: {
            mode: 'bazi',
            summary: {
              core: '甲子 乙丑 丙寅 丁卯，日主 丙'
            },
            promptText: '完整排盘内容',
            meta: {
              gender: '男'
            }
          }
        }
      },
      response,
      next
    );

    expect(reportService.createReport).toHaveBeenCalledWith({
      mode: 'bazi',
      question: '想看事业方向',
      payload: {
        mode: 'bazi',
        summary: {
          core: '甲子 乙丑 丙寅 丁卯，日主 丙'
        },
        promptText: '完整排盘内容',
        meta: {
          gender: '男'
        }
      }
    });
    expect(response.statusCode).toBe(200);
    expect(response.payload.reportId).toBe('rpt_001');
    expect(response.payload.recommendationTags).toEqual(['career_anxiety']);
    expect(next).not.toHaveBeenCalled();
  });

  it('在参数错误时交给错误处理中间件', async () => {
    const reportService = {
      createReport: vi.fn()
    };
    const next = vi.fn();
    const handler = createReportHandler({ reportService });

    await handler(
      {
        body: {
          mode: 'bazi',
          payload: {
            mode: 'bazi',
            summary: {
              core: ''
            },
            promptText: ''
          }
        }
      },
      createMockResponse(),
      next
    );

    expect(reportService.createReport).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
