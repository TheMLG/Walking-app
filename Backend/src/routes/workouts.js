import express from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { Workout } from '../models/Workout.js';
import { WeightLog } from '../models/WeightLog.js';

const router = express.Router();

const workoutSchema = z.object({
  date: z.string().datetime().or(z.string().min(10)),
  durationMinutes: z.number().positive(),
  distanceKm: z.number().positive(),
  averageSpeedKmh: z.number().positive().optional(),
  incline: z.number().nullable().optional(),
  caloriesBurned: z.number().nullable().optional(),
  weightAfterWorkoutKg: z.number().positive().nullable().optional(),
  notes: z.string().max(500).optional().default('')
});

router.post(
  '/',
  requireAuth,
  validate(workoutSchema),
  asyncHandler(async (req, res) => {
    const date = new Date(req.body.date);
    const averageSpeedKmh = req.body.averageSpeedKmh || req.body.distanceKm / (req.body.durationMinutes / 60);

    const workout = await Workout.create({
      userId: req.user._id,
      date,
      durationMinutes: req.body.durationMinutes,
      distanceKm: req.body.distanceKm,
      averageSpeedKmh,
      incline: req.body.incline ?? null,
      caloriesBurned: req.body.caloriesBurned ?? null,
      weightAfterWorkoutKg: req.body.weightAfterWorkoutKg ?? null,
      notes: req.body.notes || ''
    });

    if (req.body.weightAfterWorkoutKg) {
      await WeightLog.create({
        userId: req.user._id,
        date,
        weightKg: req.body.weightAfterWorkoutKg
      });
    }

    res.status(201).json({ workout });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const workouts = await Workout.find({ userId: req.user._id }).sort({ date: -1, createdAt: -1 }).lean();
    res.json({ workouts });
  })
);

router.patch(
  '/:id',
  requireAuth,
  validate(workoutSchema.partial()),
  asyncHandler(async (req, res) => {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      throw new HttpError(404, 'Workout not found');
    }
    if (String(workout.userId) !== String(req.user._id)) {
      throw new HttpError(403, 'You can only edit your own workouts');
    }

    if (req.body.date) {
      workout.date = new Date(req.body.date);
    }
    if (req.body.durationMinutes != null) {
      workout.durationMinutes = req.body.durationMinutes;
    }
    if (req.body.distanceKm != null) {
      workout.distanceKm = req.body.distanceKm;
    }
    if (req.body.averageSpeedKmh != null) {
      workout.averageSpeedKmh = req.body.averageSpeedKmh;
    } else if (req.body.distanceKm != null || req.body.durationMinutes != null) {
      workout.averageSpeedKmh = workout.distanceKm / (workout.durationMinutes / 60);
    }
    if (req.body.incline !== undefined) {
      workout.incline = req.body.incline;
    }
    if (req.body.caloriesBurned !== undefined) {
      workout.caloriesBurned = req.body.caloriesBurned;
    }
    if (req.body.notes !== undefined) {
      workout.notes = req.body.notes;
    }

    await workout.save();
    res.json({ workout });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      throw new HttpError(404, 'Workout not found');
    }
    if (String(workout.userId) !== String(req.user._id)) {
      throw new HttpError(403, 'You can only delete your own workouts');
    }

    await workout.deleteOne();
    res.json({ success: true });
  })
);

export default router;
