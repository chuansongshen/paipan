import { describe, expect, it, vi } from 'vitest';
import { createSessionService } from '../../server/services/sessionService.js';

describe('createSessionService', () => {
  it('创建并解析签名会话 cookie', () => {
    const logger = {
      warn: vi.fn()
    };
    const service = createSessionService({
      env: {
        sessionCookieName: 'pai_pan_sid',
        sessionCookieSecret: 'test-secret',
        sessionCookieSecure: false
      },
      logger
    });

    const sessionCookie = service.createSessionCookie({
      userId: 'usr_guest_001'
    });
    const sessionPayload = service.readSessionCookie(sessionCookie.setCookieHeader);

    expect(sessionCookie.cookieValue).toContain('.');
    expect(sessionCookie.setCookieHeader).toContain('HttpOnly');
    expect(sessionPayload.userId).toBe('usr_guest_001');
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
