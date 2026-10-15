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
import { env } from '../config/env.js';

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
  password: z.string().min(8).max(128),
  avatar: z.string().trim().min(1).max(50).optional()
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  avatar: z.string().trim().min(1).max(50).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(128).optional()
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Current password is required to change your password',
  path: ['currentPassword']
});

function setAuthCookie(res, token) {
  res.cookie('authToken', token, {
    httpOnly: true,
    sameSite: env.cookieSameSite,
    secure: env.cookieSecure,
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
      passwordHash,
      avatar: req.body.avatar || 'lion'
    });

    const token = signAuthToken(user._id);
    setAuthCookie(res, token);
    res.status(201).json({
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || 'lion',
        createdAt: user.createdAt
      }
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
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || 'lion',
        createdAt: user.createdAt
      }
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
    res.json({
      user: {
        id: req.user._id,
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar || 'lion',
        createdAt: req.user.createdAt
      }
    });
  })
);

router.patch(
  '/me',
  requireAuth,
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const { name, avatar, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    if (newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new HttpError(400, 'Current password does not match');
      }
      user.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    res.json({
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || 'lion',
        createdAt: user.createdAt
      }
    });
  })
);

export default router;
