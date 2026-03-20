export class AppError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'AppError';
    this.code = options.code || 'APP_ERROR';
    this.statusCode = options.statusCode || 500;
    this.details = options.details || null;
  }
}

export function createAppError(message, options) {
  return new AppError(message, options);
}
