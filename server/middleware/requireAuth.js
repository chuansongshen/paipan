import { createAppError } from '../errors/appError.js';

export function createRequireAuthMiddleware() {
  return (request, _response, next) => {
    if (!request.user?.id) {
      next(createAppError('[Auth] 当前请求未登录', {
        code: 'AUTH_REQUIRED',
        statusCode: 401
      }));
      return;
    }

    next();
  };
}
