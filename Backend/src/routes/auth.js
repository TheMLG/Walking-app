import express from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { User } from '../models/User.js';
import { signAuthToken } from '../services/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import { issueCsrfToken } from '../middleware/csrf.js';
import { HttpError } from '../utils/httpError.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
});

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128)
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

function setAuthCookie(res, token) {
  res.cookie('authToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

router.get('/csrf', issueCsrfToken);

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) {
      throw new HttpError(409, 'An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      passwordHash
    });

    const token = signAuthToken(user._id);
    setAuthCookie(res, token);
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt }
    });
  })
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const ok = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!ok) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const token = signAuthToken(user._id);
    setAuthCookie(res, token);
    res.json({
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt }
    });
  })
);

router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    res.clearCookie('authToken', { path: '/' });
    res.clearCookie('csrfToken', { path: '/' });
    res.json({ success: true });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

router.patch(
  '/me',
  requireAuth,
  validate(
    z.object({
      name: z.string().trim().min(2).max(80)
    })
  ),
  asyncHandler(async (req, res) => {
    const updated = await User.findByIdAndUpdate(req.user._id, { name: req.body.name }, { new: true }).select('_id name email createdAt');
    res.json({ user: updated });
  })
);

export default router;
