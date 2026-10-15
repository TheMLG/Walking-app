import { User } from '../models/User.js';
import { Workout } from '../models/Workout.js';
import { Goal } from '../models/Goal.js';
import { WeightLog } from '../models/WeightLog.js';
import { env } from '../config/env.js';
import { formatZonedDateKey, getZonedMonthWindow, getZonedWeekWindow, getZonedWindow, shiftDateKey } from '../utils/time.js';

const TIME_ZONE = 'UTC';

function summarize(workouts) {
  const days = new Map();
  let distanceKm = 0;
  let durationMinutes = 0;
  let longestSessionDistance = 0;

  for (const workout of workouts) {
    distanceKm += workout.distanceKm;
    durationMinutes += workout.durationMinutes;
    longestSessionDistance = Math.max(longestSessionDistance, workout.distanceKm);
    const key = formatZonedDateKey(workout.date, TIME_ZONE);
    if (!days.has(key)) days.set(key, []);
    days.get(key).push(workout);
  }

  const qualifyingDays = [...days.entries()]
    .filter(([, entries]) => entries.some((entry) => entry.durationMinutes >= env.minQualifyingDurationMinutes))
    .map(([key]) => key)
    .sort();

  return {
    distanceKm,
    durationMinutes,
    workoutCount: workouts.length,
    activeDays: qualifyingDays.length,
    longestSessionDistance,
    qualifyingDays
  };
}

function getStreaks(qualifyingDays, now) {
  const daySet = new Set(qualifyingDays);
  let currentStreak = 0;
  let currentKey = formatZonedDateKey(now, TIME_ZONE);

  while (daySet.has(currentKey)) {
    currentStreak += 1;
    currentKey = shiftDateKey(currentKey, -1);
  }

  let longestStreak = 0;
  let running = 0;
  let previous = null;
  for (const key of qualifyingDays) {
    if (!previous || Math.round((new Date(`${key}T00:00:00Z`) - new Date(`${previous}T00:00:00Z`)) / 86400000) !== 1) {
      running = 1;
    } else {
      running += 1;
    }
    longestStreak = Math.max(longestStreak, running);
    previous = key;
  }

  return { currentStreak, longestStreak };
}

export async function getDashboardSnapshot(userId) {
  const goals = await Goal.findOne({ userId }).lean();
  const weights = await WeightLog.find({ userId }).sort({ date: -1 }).limit(60).lean();
  const now = new Date();
  const today = getZonedWindow(TIME_ZONE, now);
  const week = getZonedWeekWindow(TIME_ZONE, now);
  const month = getZonedMonthWindow(TIME_ZONE, now);

  const [todayWorkouts, weekWorkouts, monthWorkouts, allWorkouts, recentWorkouts] = await Promise.all([
    Workout.find({ userId, date: { $gte: today.start, $lt: today.end } }).sort({ date: -1, createdAt: -1 }).lean(),
    Workout.find({ userId, date: { $gte: week.start, $lt: week.end } }).sort({ date: -1, createdAt: -1 }).lean(),
    Workout.find({ userId, date: { $gte: month.start, $lt: month.end } }).sort({ date: -1, createdAt: -1 }).lean(),
    Workout.find({ userId }).sort({ date: -1, createdAt: -1 }).lean(),
    Workout.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(8).lean()
  ]);

  const [allUsers, allUserWorkouts] = await Promise.all([
    User.find({}).select('_id name email avatar').sort({ name: 1 }).lean(),
    Workout.find({}).select('userId date distanceKm durationMinutes').lean()
  ]);
  const statsByUser = new Map();

  for (const workout of allUserWorkouts) {
    const key = String(workout.userId);
    if (!statsByUser.has(key)) {
      statsByUser.set(key, { distanceKm: 0, durationMinutes: 0, workoutCount: 0, activeDays: new Set() });
    }
    const stats = statsByUser.get(key);
    stats.distanceKm += workout.distanceKm;
    stats.durationMinutes += workout.durationMinutes;
    stats.workoutCount += 1;
    if (workout.durationMinutes >= env.minQualifyingDurationMinutes) {
      stats.activeDays.add(formatZonedDateKey(workout.date, TIME_ZONE));
    }
  }

  const leaderboard = allUsers
    .map((user) => {
      const stats = statsByUser.get(String(user._id)) || { distanceKm: 0, durationMinutes: 0, workoutCount: 0, activeDays: new Set() };
      return {
        userId: String(user._id),
        name: user.name,
        email: user.email,
        avatar: user.avatar || 'lion',
        totalDistanceKm: stats.distanceKm,
        totalDurationMinutes: stats.durationMinutes,
        sessions: stats.workoutCount,
        activeDays: stats.activeDays.size
      };
    })
    .sort((a, b) => b.totalDistanceKm - a.totalDistanceKm || b.activeDays - a.activeDays || a.name.localeCompare(b.name))
    .map((entry, index) => ({ ...entry, rank: index + 1, isCurrentUser: String(entry.userId) === String(userId) }));

  const overall = summarize(allWorkouts);
  const streaks = getStreaks(overall.qualifyingDays, now);
  const currentUserRank = leaderboard.find((entry) => entry.isCurrentUser)?.rank || null;

  return {
    timezone: TIME_ZONE,
    todaysStats: summarize(todayWorkouts),
    weeklyStats: summarize(weekWorkouts),
    monthlyStats: summarize(monthWorkouts),
    overallStats: {
      ...overall,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      leaderboardRank: currentUserRank
    },
    recentWorkouts,
    leaderboard,
    weeklyDistanceTargetKm: goals?.weeklyDistanceTargetKm != null ? goals.weeklyDistanceTargetKm : 15,
    weeklyActiveDaysTarget: goals?.weeklyActiveDaysTarget != null ? goals.weeklyActiveDaysTarget : 5,
    targetWeightKg: goals?.targetWeightKg != null ? goals.targetWeightKg : null,
    latestWeightEntry: weights[0] || null,
    weightHistory: weights
  };
}
