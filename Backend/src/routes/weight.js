import express from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../utils/httpError.js';
import { WeightLog } from '../models/WeightLog.js';

const router = express.Router();

const weightSchema = z.object({
  date: z.string().datetime().or(z.string().min(10)),
  weightKg: z.number().positive()
});

router.post(
  '/',
  requireAuth,
  validate(weightSchema),
  asyncHandler(async (req, res) => {
    const log = await WeightLog.create({
      userId: req.user._id,
      date: new Date(req.body.date),
      weightKg: req.body.weightKg
    });
    res.status(201).json({ weightLog: log });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const weightLogs = await WeightLog.find({ userId: req.user._id }).sort({ date: -1 }).lean();
    res.json({ weightLogs });
  })
);

router.patch(
  '/:id',
  requireAuth,
  validate(weightSchema.partial()),
  asyncHandler(async (req, res) => {
    const log = await WeightLog.findById(req.params.id);
    if (!log) {
      throw new HttpError(404, 'Weight log not found');
    }
    if (String(log.userId) !== String(req.user._id)) {
      throw new HttpError(403, 'You can only edit your own weight logs');
    }
    if (req.body.date) {
      log.date = new Date(req.body.date);
    }
    if (req.body.weightKg != null) {
      log.weightKg = req.body.weightKg;
    }
    await log.save();
    res.json({ weightLog: log });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const log = await WeightLog.findById(req.params.id);
    if (!log) {
      throw new HttpError(404, 'Weight log not found');
    }
    if (String(log.userId) !== String(req.user._id)) {
      throw new HttpError(403, 'You can only delete your own weight logs');
    }
    await log.deleteOne();
    res.json({ success: true });
  })
);

export default router;
