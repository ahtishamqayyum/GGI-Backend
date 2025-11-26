export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class QuotaExceededError extends AppError {
  constructor(message: string = 'Quota exceeded. Please upgrade your subscription.') {
    super(message, 403, 'QUOTA_EXCEEDED');
  }
}

export class InvalidSubscriptionError extends AppError {
  constructor(message: string = 'Invalid or inactive subscription.') {
    super(message, 403, 'INVALID_SUBSCRIPTION');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found.`, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

