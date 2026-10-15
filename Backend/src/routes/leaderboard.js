import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Workout } from '../models/Workout.js';
import { env } from '../config/env.js';
import { formatZonedDateKey, getZonedMonthWindow, getZonedWeekWindow, getZonedWindow } from '../utils/time.js';

const router = express.Router();
const TIME_ZONE = 'UTC';

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const period = String(req.query.period || 'all');
    const metric = String(req.query.metric || 'distance');
    const now = new Date();
    const windows = {
      today: getZonedWindow(TIME_ZONE, now),
      week: getZonedWeekWindow(TIME_ZONE, now),
      month: getZonedMonthWindow(TIME_ZONE, now)
    };
    const selectedWindow = period === 'today' ? windows.today : period === 'week' ? windows.week : period === 'month' ? windows.month : null;
    const dateFilter = selectedWindow ? { date: { $gte: selectedWindow.start, $lt: selectedWindow.end } } : {};

    const [users, workouts] = await Promise.all([
      User.find({}).select('_id name email avatar').sort({ name: 1 }).lean(),
      Workout.find(dateFilter).select('userId date distanceKm durationMinutes').lean()
    ]);

    const statsByUser = new Map();
    for (const workout of workouts) {
      const userId = String(workout.userId);
      if (!statsByUser.has(userId)) {
        statsByUser.set(userId, {
          totalDistanceKm: 0,
          totalDurationMinutes: 0,
          sessions: 0,
          activeDayKeys: new Set()
        });
      }

      const stats = statsByUser.get(userId);
      stats.totalDistanceKm += workout.distanceKm;
      stats.totalDurationMinutes += workout.durationMinutes;
      stats.sessions += 1;
      if (workout.durationMinutes >= env.minQualifyingDurationMinutes) {
        stats.activeDayKeys.add(formatZonedDateKey(workout.date, TIME_ZONE));
      }
    }

    const rows = users.map((user) => {
      const stats = statsByUser.get(String(user._id)) || {
        totalDistanceKm: 0,
        totalDurationMinutes: 0,
        sessions: 0,
        activeDayKeys: new Set()
      };
      const activeDays = stats.activeDayKeys.size;
      const selectedMetric =
        metric === 'duration'
          ? stats.totalDurationMinutes
          : metric === 'sessions'
            ? stats.sessions
            : metric === 'activeDays'
              ? activeDays
              : stats.totalDistanceKm;

      return {
        userId: String(user._id),
        name: user.name,
        email: user.email,
        avatar: user.avatar || 'lion',
        totalDistanceKm: stats.totalDistanceKm,
        totalDurationMinutes: stats.totalDurationMinutes,
        sessions: stats.sessions,
        activeDays,
        selectedMetric
      };
    });

    rows.sort((a, b) => b.selectedMetric - a.selectedMetric || b.totalDistanceKm - a.totalDistanceKm || a.name.localeCompare(b.name));

    res.json({
      period,
      metric,
      timezone: TIME_ZONE,
      leaderboard: rows.map((row, index) => ({
        ...row,
        rank: index + 1,
        isCurrentUser: row.userId === String(req.user._id)
      }))
    });
  })
);

export default router;
