import { describe, expect, it, vi } from 'vitest';
import {
  createDevSessionHandler,
  createGetSessionHandler
} from '../../server/routes/authRoutes.js';

function createMockResponse() {
  return {
    statusCode: 200,
    payload: null,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    }
  };
}

describe('auth routes', () => {
  it('在开发环境创建访客会话', async () => {
    const response = createMockResponse();
    const next = vi.fn();
    const handler = createDevSessionHandler({
      authService: {
        createDevSession: vi.fn().mockResolvedValue({
          authenticated: true,
          user: {
            id: 'usr_guest_001',
            identityProvider: 'guest',
            displayName: '访客用户'
          },
          setCookieHeader: 'pai_pan_sid=session_001; Path=/; HttpOnly'
        })
      }
    });

    await handler({}, response, next);

    expect(response.statusCode).toBe(200);
    expect(response.payload.user.id).toBe('usr_guest_001');
    expect(response.headers['set-cookie']).toBe('pai_pan_sid=session_001; Path=/; HttpOnly');
    expect(next).not.toHaveBeenCalled();
  });

  it('返回当前 session 摘要', async () => {
    const response = createMockResponse();
    const next = vi.fn();
    const handler = createGetSessionHandler({
      authService: {
        getSessionView: vi.fn().mockResolvedValue({
          authenticated: true,
          user: {
            id: 'usr_guest_001',
            identityProvider: 'guest',
            displayName: '访客用户'
          }
        })
      }
    });

    await handler({ headers: {} }, response, next);

    expect(response.statusCode).toBe(200);
    expect(response.payload.authenticated).toBe(true);
    expect(response.payload.user.id).toBe('usr_guest_001');
    expect(next).not.toHaveBeenCalled();
  });
});
