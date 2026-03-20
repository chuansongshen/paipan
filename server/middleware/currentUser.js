export function createCurrentUserMiddleware({ authService, logger }) {
  return async (request, _response, next) => {
    if (!authService?.getSessionUser) {
      request.user = null;
      next();
      return;
    }

    try {
      const user = await authService.getSessionUser(request);

      request.user = user || null;

      if (user && typeof request.addLogContext === 'function') {
        request.addLogContext({
          userId: user.id
        });
      }
    } catch (error) {
      request.user = null;
      logger?.warn?.({ err: error, requestId: request.requestId }, '[Auth] 解析当前用户失败');
    }

    next();
  };
}
