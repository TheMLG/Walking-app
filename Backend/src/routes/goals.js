import express from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { Goal } from '../models/Goal.js';

const router = express.Router();

const goalSchema = z.object({
  weeklyDistanceTargetKm: z.coerce.number().min(0).optional(),
  weeklyActiveDaysTarget: z.coerce.number().min(0).max(7).optional(),
  targetWeightKg: z.coerce.number().positive().nullable().optional()
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
    const update = { userId: req.user._id };
    if (req.body.weeklyDistanceTargetKm !== undefined) {
      update.weeklyDistanceTargetKm = req.body.weeklyDistanceTargetKm;
    }
    if (req.body.weeklyActiveDaysTarget !== undefined) {
      update.weeklyActiveDaysTarget = req.body.weeklyActiveDaysTarget;
    }
    if (req.body.targetWeightKg !== undefined) {
      update.targetWeightKg = req.body.targetWeightKg;
    }

    const goal = await Goal.findOneAndUpdate(
      { userId: req.user._id },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ goal });
  })
);

export default router;
