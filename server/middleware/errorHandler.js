function resolveErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return '未知错误';
}

export function createErrorHandler({ logger }) {
  return (error, request, response, _next) => {
    logger.error(
      {
        err: error,
        requestId: request.requestId || 'unknown'
      },
      '[Api] 请求处理失败'
    );

    response.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务暂时不可用，请稍后重试',
      detail: resolveErrorMessage(error)
    });
  };
}

export function registerErrorHandler(app, options) {
  app.use(createErrorHandler(options));
}
