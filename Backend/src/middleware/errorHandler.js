import { HttpError } from '../utils/httpError.js';

export function notFoundHandler(req, res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const payload = {
    message: err.message || 'Internal server error'
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
    payload.code = err.code;
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json(payload);
}
