import { randomUUID } from 'crypto';

export function createRequestContextMiddleware({ logger }) {
  return (request, response, next) => {
    const requestId = request.headers['x-request-id'] || randomUUID();

    request.requestId = requestId;
    response.locals.requestId = requestId;

    logger.info(
      {
        requestId,
        method: request.method,
        path: request.path
      },
      '[Api] 请求进入'
    );

    next();
  };
}
