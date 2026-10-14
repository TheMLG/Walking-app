import express from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = express.Router();

router.patch(
  '/',
  requireAuth,
  validate(
    z.object({
      name: z.string().trim().min(2).max(80)
    })
  ),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, { name: req.body.name }, { new: true }).select('_id name email createdAt');
    res.json({ user });
  })
);

export default router;
