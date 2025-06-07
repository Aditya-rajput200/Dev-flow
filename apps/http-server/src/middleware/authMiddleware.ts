import { RequestHandler } from 'express';
import { AppError } from '../utils/errorHandler';

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  next(new AppError('Unauthorized', 'Authentication required', 401));
};

export const isUnauthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) return next();
  next(new AppError('AlreadyAuthenticated', 'You are already logged in', 400));
};