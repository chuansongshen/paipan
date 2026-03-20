import { describe, expect, it } from 'vitest';
import { getHealthHandler } from '../routes/healthRoutes.js';

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

describe('getHealthHandler', () => {
  it('返回基础存活状态', () => {
    const handler = getHealthHandler();
    const response = createMockResponse();

    handler({}, response);

    expect(response.statusCode).toBe(200);
    expect(response.payload).toEqual({ status: 'ok' });
  });
});
