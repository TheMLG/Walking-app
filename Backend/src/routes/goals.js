import express from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { Goal } from '../models/Goal.js';

const router = express.Router();

const goalSchema = z.object({
  weeklyDistanceTargetKm: z.number().min(0).default(0),
  weeklyActiveDaysTarget: z.number().min(0).default(0)
});

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const goal = await Goal.findOne({ userId: req.user._id }).lean();
    res.json({ goal });
  })
);

router.put(
  '/',
  requireAuth,
  validate(goalSchema),
  asyncHandler(async (req, res) => {
    const goal = await Goal.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        weeklyDistanceTargetKm: req.body.weeklyDistanceTargetKm,
        weeklyActiveDaysTarget: req.body.weeklyActiveDaysTarget
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    res.json({ goal });
  })
);

export default router;
