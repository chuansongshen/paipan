import { z } from 'zod';

const wechatExchangeSchema = z.object({
  code: z.string().trim().min(1)
});

function parseWechatExchangeRequest(input) {
  return wechatExchangeSchema.parse(input);
}

export function createGetSessionHandler({ authService }) {
  if (!authService) {
    throw new Error('[AuthRoute] 缺少 authService 依赖');
  }

  return async (request, response, next) => {
    try {
      const sessionView = await authService.getSessionView(request);
      response.status(200).json(sessionView);
    } catch (error) {
      next(error);
    }
  };
}

export function createDevSessionHandler({ authService }) {
  if (!authService) {
    throw new Error('[AuthRoute] 缺少 authService 依赖');
  }

  return async (_request, response, next) => {
    try {
      const sessionView = await authService.createDevSession();

      if (sessionView.setCookieHeader) {
        response.setHeader('Set-Cookie', sessionView.setCookieHeader);
      }

      response.status(200).json({
        authenticated: sessionView.authenticated,
        user: sessionView.user
      });
    } catch (error) {
      next(error);
    }
  };
}

export function createWechatExchangeHandler({ authService }) {
  if (!authService) {
    throw new Error('[AuthRoute] 缺少 authService 依赖');
  }

  return async (request, response, next) => {
    try {
      const input = parseWechatExchangeRequest(request.body);
      const sessionView = await authService.exchangeWechatCode(input);

      if (sessionView.setCookieHeader) {
        response.setHeader('Set-Cookie', sessionView.setCookieHeader);
      }

      response.status(200).json({
        authenticated: sessionView.authenticated,
        user: sessionView.user
      });
    } catch (error) {
      next(error);
    }
  };
}

export function registerAuthRoutes(app, services = {}) {
  if (!services.authService) {
    return;
  }

  app.get(
    '/api/auth/session',
    createGetSessionHandler({
      authService: services.authService
    })
  );
  app.post(
    '/api/auth/dev-session',
    createDevSessionHandler({
      authService: services.authService
    })
  );
  app.post(
    '/api/auth/wechat/exchange',
    createWechatExchangeHandler({
      authService: services.authService
    })
  );
}
