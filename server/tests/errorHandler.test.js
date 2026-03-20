import { describe, expect, it, vi } from 'vitest';
import { createErrorHandler } from '../middleware/errorHandler.js';

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

describe('createErrorHandler', () => {
  it('返回结构化错误响应并记录日志', () => {
    const logger = {
      error: vi.fn()
    };
    const handler = createErrorHandler({ logger });
    const response = createMockResponse();

    handler(new Error('boom'), { requestId: 'req_001' }, response, vi.fn());

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toBe(500);
    expect(response.payload).toEqual({
      code: 'INTERNAL_ERROR',
      message: '服务暂时不可用，请稍后重试',
      detail: 'boom'
    });
  });
});
