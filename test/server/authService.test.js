import { describe, expect, it, vi } from 'vitest';
import { createAuthService } from '../../server/services/authService.js';

describe('createAuthService', () => {
  it('在微信身份配置缺失时返回明确错误', async () => {
    const authService = createAuthService({
      env: {
        nodeEnv: 'production',
        wechatAppId: '',
        wechatAppSecret: '',
        wechatOauthRedirectUri: '',
        wechatOauthScope: 'snsapi_base'
      },
      logger: {
        warn: vi.fn(),
        info: vi.fn()
      },
      sessionService: {
        readSessionCookie: vi.fn()
      },
      userService: {
        findUserById: vi.fn(),
        touchUserLastSeen: vi.fn(),
        createGuestUser: vi.fn()
      }
    });

    await expect(authService.exchangeWechatCode({
      code: 'wx_code_001'
    })).rejects.toMatchObject({
      code: 'WECHAT_AUTH_NOT_CONFIGURED',
      statusCode: 409
    });
  });

  it('在微信配置齐全但未接真实交换实现时返回占位错误', async () => {
    const logger = {
      warn: vi.fn(),
      info: vi.fn()
    };
    const authService = createAuthService({
      env: {
        nodeEnv: 'production',
        wechatAppId: 'wx_demo',
        wechatAppSecret: 'secret_demo',
        wechatOauthRedirectUri: 'https://example.com/oauth/callback',
        wechatOauthScope: 'snsapi_base'
      },
      logger,
      sessionService: {
        readSessionCookie: vi.fn()
      },
      userService: {
        findUserById: vi.fn(),
        touchUserLastSeen: vi.fn(),
        createGuestUser: vi.fn()
      }
    });

    await expect(authService.exchangeWechatCode({
      code: 'wx_code_001'
    })).rejects.toMatchObject({
      code: 'WECHAT_AUTH_NOT_READY',
      statusCode: 409
    });
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });
});
