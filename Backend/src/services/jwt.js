import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAuthToken(userId) {
  return jwt.sign({}, env.jwtSecret, { subject: String(userId), expiresIn: '7d' });
}
