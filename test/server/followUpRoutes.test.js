import { describe, expect, it, vi } from 'vitest';
import { createFollowUpHandler } from '../../server/routes/followUpRoutes.js';

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

describe('createFollowUpHandler', () => {
  it('校验参数并返回追问结果', async () => {
    const followUpService = {
      answerQuestion: vi.fn().mockResolvedValue({
        answer: '建议先稳后动',
        remainingCredits: 1,
        usageMetadata: null,
        recommendationTags: ['career_anxiety']
      })
    };
    const next = vi.fn();
    const response = createMockResponse();
    const handler = createFollowUpHandler({ followUpService });

    await handler(
      {
        params: {
          reportId: 'rpt_001'
        },
        body: {
          message: '今年适合换工作吗？',
          userId: 'user_001'
        }
      },
      response,
      next
    );

    expect(followUpService.answerQuestion).toHaveBeenCalledWith({
      reportId: 'rpt_001',
      message: '今年适合换工作吗？',
      userId: 'user_001'
    });
    expect(response.statusCode).toBe(200);
    expect(response.payload.remainingCredits).toBe(1);
    expect(response.payload.recommendationTags).toEqual(['career_anxiety']);
    expect(next).not.toHaveBeenCalled();
  });
});
