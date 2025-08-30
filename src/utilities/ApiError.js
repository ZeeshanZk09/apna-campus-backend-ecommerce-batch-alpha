class ApiError extends Error {
  constructor(statusCode, message, errors, stack) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;

    if (errors) {
      this.errors = errors ?? null;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
