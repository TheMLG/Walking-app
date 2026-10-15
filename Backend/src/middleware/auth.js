import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import { User } from '../models/User.js';

export async function requireAuth(req, res, next) {
  const token = req.cookies.authToken;
  if (!token) {
    return next(new HttpError(401, 'Authentication required'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).select('_id name email avatar createdAt');
    if (!user) {
      return next(new HttpError(401, 'Authentication required'));
    }
    req.user = user;
    next();
  } catch {
    next(new HttpError(401, 'Authentication required'));
  }
}
