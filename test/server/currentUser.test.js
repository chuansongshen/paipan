import { describe, expect, it, vi } from 'vitest';
import { createCurrentUserMiddleware } from '../../server/middleware/currentUser.js';

describe('createCurrentUserMiddleware', () => {
  it('在 session 有效时挂载 request.user', async () => {
    const request = {
      requestId: 'req_001',
      headers: {},
      addLogContext: vi.fn()
    };
    const middleware = createCurrentUserMiddleware({
      authService: {
        getSessionUser: async () => ({
          id: 'usr_guest_001',
          identityProvider: 'guest',
          displayName: '访客用户'
        })
      },
      logger: {
        warn: vi.fn()
      }
    });
    const next = vi.fn();

    await middleware(request, {}, next);

    expect(request.user.id).toBe('usr_guest_001');
    expect(request.addLogContext).toHaveBeenCalledWith({
      userId: 'usr_guest_001'
    });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
