import { createAppError } from '../errors/appError.js';

function normalizeSessionView(user) {
  if (!user) {
    return {
      authenticated: false,
      user: null
    };
  }

  return {
    authenticated: true,
    user: {
      id: user.id,
      identityProvider: user.identityProvider,
      displayName: user.displayName,
      providerSubject: user.providerSubject || null
    }
  };
}

export function createAuthService({ env, logger, sessionService, userService }) {
  if (!sessionService) {
    throw new Error('[Auth] 缺少 sessionService 依赖');
  }

  if (!userService) {
    throw new Error('[Auth] 缺少 userService 依赖');
  }

  return {
    async getSessionUser(request) {
      const sessionPayload = sessionService.readSessionCookie(request?.headers?.cookie || '');

      if (!sessionPayload?.userId) {
        return null;
      }

      const user = await userService.findUserById(sessionPayload.userId);

      if (!user) {
        logger?.warn?.({ userId: sessionPayload.userId }, '[Auth] 当前会话对应的用户不存在');
        return null;
      }

      await userService.touchUserLastSeen(user.id);
      return user;
    },

    async getSessionView(request) {
      return normalizeSessionView(await this.getSessionUser(request));
    },

    async createDevSession() {
      if (env.nodeEnv === 'production') {
        throw createAppError('[Auth] 生产环境不允许创建开发态访客会话', {
          code: 'DEV_SESSION_DISABLED',
          statusCode: 404
        });
      }

      const user = await userService.createGuestUser();
      const { cookieValue, setCookieHeader } = sessionService.createSessionCookie({
        userId: user.id
      });

      logger?.info?.({ userId: user.id }, '[Auth] 已创建开发态访客会话');

      return {
        ...normalizeSessionView(user),
        cookieValue,
        setCookieHeader
      };
    },

    async exchangeWechatCode() {
      throw createAppError('[Auth] 当前环境尚未接入微信身份交换能力', {
        code: 'WECHAT_AUTH_NOT_READY',
        statusCode: 409
      });
    }
  };
}
