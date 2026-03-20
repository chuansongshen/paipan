function resolveErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return '未知错误';
}

export function createErrorHandler({ logger }) {
  return (error, request, response, _next) => {
    const statusCode = Number(error?.statusCode) || 500;
    const code = error?.code || (statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR');
    const requestLogger = request.logger || logger;

    requestLogger.error(
      {
        err: error,
        requestId: request.requestId || 'unknown',
        statusCode,
        code
      },
      '[Api] 请求处理失败'
    );

    response.status(statusCode).json({
      code,
      message: statusCode >= 500 ? '服务暂时不可用，请稍后重试' : resolveErrorMessage(error),
      detail: resolveErrorMessage(error)
    });
  };
}

export function registerErrorHandler(app, options) {
  app.use(createErrorHandler(options));
}
