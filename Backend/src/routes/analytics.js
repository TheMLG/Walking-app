import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { getDashboardSnapshot } from '../services/dashboard.js';

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const snapshot = await getDashboardSnapshot(req.user._id);
    res.json(snapshot);
  })
);

export default router;
