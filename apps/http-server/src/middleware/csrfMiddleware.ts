import { RequestHandler, ErrorRequestHandler } from 'express';
import csurf from 'csurf';
import { AppError } from '../utils/errorHandler';

// CSRF protection middleware
export const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  },
  value: (req) => {
     console.log('Reading CSRF token from', req.headers['x-csrf-token'])
    return req.headers['x-csrf-token'] || req.body._csrf
  }
  
  
});

// CSRF token provider middleware
export const csrfTokenProvider: RequestHandler = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken;
  next();
};

// Error handler specifically for CSRF failures
export const csrfErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  next(new AppError('InvalidCSRFToken', 'Invalid CSRF token', 403));
};