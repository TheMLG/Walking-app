import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { HttpError } from '../utils/httpError.js';

const router = express.Router();

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

router.get(
  '/',
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
  '/',
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

