import { ErrorRequestHandler } from "express";

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public originalError?: Error
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Handle CSRF errors separately
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({
      error: 'InvalidCSRFToken',
      message: 'Invalid CSRF token'
    });
    return;
  }

  // Handle our custom AppErrors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message
    });
    return;
  }

  // Handle unexpected errors
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'InternalServerError',
    message: 'Something went wrong'
  });
};