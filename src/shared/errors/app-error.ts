export enum ErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  CONFLICT = 'CONFLICT',
  INTEGRITY_FAILURE = 'INTEGRITY_FAILURE',
  INTERNAL = 'INTERNAL',
}

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, ErrorCode.NOT_FOUND, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, ErrorCode.CONFLICT, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, ErrorCode.VALIDATION, message);
  }
}

export class IntegrityError extends AppError {
  constructor(message: string) {
    super(422, ErrorCode.INTEGRITY_FAILURE, message);
  }
}
