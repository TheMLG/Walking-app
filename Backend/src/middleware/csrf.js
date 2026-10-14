import crypto from 'crypto';
import { HttpError } from '../utils/httpError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function issueCsrfToken(req, res) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrfToken', token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    path: '/'
  });
  res.json({ csrfToken: token });
}

export function requireCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const publicMutationRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/csrf'
  ];

  if (publicMutationRoutes.includes(req.originalUrl)) {
    return next();
  }

  const cookieToken = req.cookies.csrfToken;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new HttpError(403, 'Invalid CSRF token'));
  }

  next();
}
