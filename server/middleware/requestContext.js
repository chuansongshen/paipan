import { randomUUID } from 'crypto';

export function createRequestContextMiddleware({ logger }) {
  return (request, response, next) => {
    const requestId = request.headers['x-request-id'] || randomUUID();
    let requestLogger = logger.child({ requestId });

    request.requestId = requestId;
    request.logger = requestLogger;
    request.addLogContext = (context = {}) => {
      requestLogger = requestLogger.child(context);
      request.logger = requestLogger;
      response.locals.logger = requestLogger;
    };
    response.locals.requestId = requestId;
    response.locals.logger = requestLogger;

    requestLogger.info(
      {
        method: request.method,
        path: request.path
      },
      '[Api] 请求进入'
    );

    next();
  };
}
