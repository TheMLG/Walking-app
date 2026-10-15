import { useEffect, useState } from 'react';
import { Flame, Plus, Settings, Trophy, TrendingUp, Calendar, Clock, Footprints, X, Loader2, Scale, Target, Pencil } from 'lucide-react';
import api from '../services/api';
import { Button, Card } from '../components/ui';
import { StatCard } from '../components/StatCard';
import { Avatar } from '../components/Avatar';
import { SettingsModal } from '../components/SettingsModal';
import { WeightModal } from '../components/WeightModal';
import { EditGoalsModal } from '../components/EditGoalsModal';
import { WeightTracker } from '../components/WeightTracker';
import { useAuth } from '../context/AuthContext';
import { getAvatarPreset } from '../data/avatarPresets';

function formatKm(value) {
  return `${Number(value || 0).toFixed(1)} km`;
}

function formatMinutes(value) {
  return `${Math.round(Number(value || 0))} min`;
}

function getCurrentTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getCurrentDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [busy, setBusy] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [goalsModalOpen, setGoalsModalOpen] = useState(false);
  const [goalsFocusField, setGoalsFocusField] = useState('all');

  // Quick Workout Log Modal state
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [distanceKm, setDistanceKm] = useState('3.0');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [workoutTime, setWorkoutTime] = useState(getCurrentTimeString());
  const [workoutDate, setWorkoutDate] = useState(getCurrentDateString());
  const [submittingWorkout, setSubmittingWorkout] = useState(false);
  const [workoutError, setWorkoutError] = useState('');

  async function load() {
    setBusy(true);
    try {
      const response = await api.get('/api/dashboard');
      const data = response.data;
      if (data) {
        // Fallback to locally cached values if server hasn't returned them
        const cachedTarget = localStorage.getItem('wb_target_weight');
        if (data.targetWeightKg == null && cachedTarget) {
          data.targetWeightKg = parseFloat(cachedTarget);
        }
        const cachedDist = localStorage.getItem('wb_distance_target');
        if (data.weeklyDistanceTargetKm == null && cachedDist) {
          data.weeklyDistanceTargetKm = parseFloat(cachedDist);
        }
        const cachedDays = localStorage.getItem('wb_days_target');
        if (data.weeklyActiveDaysTarget == null && cachedDays) {
          data.weeklyActiveDaysTarget = parseInt(cachedDays, 10);
        }
      }
      setSnapshot(data);
    } catch (err) {
      console.error('Failed to load dashboard snapshot', err);
    } finally {
      setBusy(false);
    }
  }

  function openGoalsModal(field = 'all') {
    setGoalsFocusField(field);
    setGoalsModalOpen(true);
  }

  function handleGoalsSaved(updated) {
    setSnapshot((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weeklyDistanceTargetKm: updated.weeklyDistanceTargetKm,
        weeklyActiveDaysTarget: updated.weeklyActiveDaysTarget,
        targetWeightKg: updated.targetWeightKg
      };
    });
    load();
  }

  useEffect(() => {
    load();
  }, []);

  function openLogModal() {
    setWorkoutTime(getCurrentTimeString());
    setWorkoutDate(getCurrentDateString());
    setWorkoutError('');
    setLogModalOpen(true);
  }

  async function handleLogWorkout(e) {
    e.preventDefault();
    setWorkoutError('');
    const dist = parseFloat(distanceKm);
    const dur = parseFloat(durationMinutes);
    if (!dist || dist <= 0) {
      setWorkoutError('Please enter a valid distance.');
      return;
    }
    if (!dur || dur <= 0) {
      setWorkoutError('Please enter a valid duration.');
      return;
    }

    setSubmittingWorkout(true);
    try {
      const combinedDate = new Date(`${workoutDate}T${workoutTime || '12:00'}:00`);
      const finalDate = isNaN(combinedDate.getTime()) ? new Date() : combinedDate;

      await api.post('/api/workouts', {
        date: finalDate.toISOString(),
        distanceKm: dist,
        durationMinutes: dur
      });
      setLogModalOpen(false);
      await load();
    } catch (err) {
      setWorkoutError(err?.response?.data?.message || 'Failed to log workout');
    } finally {
      setSubmittingWorkout(false);
    }
  }

  const leaderboard = snapshot?.leaderboard || [];
  const currentPreset = getAvatarPreset(user?.avatar);
  const streak = snapshot?.overallStats?.currentStreak || 0;
  const currentRank = snapshot?.overallStats?.leaderboardRank;

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:px-8">
      {/* 1. Professional Clean Header - No bulky card box */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            {/* Status & Streak Row */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                Walkin' Bros
              </span>
              <span className="text-white/20 text-xs">•</span>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-400">
                <Flame className="h-3 w-3 fill-orange-400/20" />
                <span>{streak}d Streak</span>
              </div>
              {currentRank ? (
                <>
                  <span className="text-white/20 text-xs">•</span>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300">
                    <Trophy className="h-3 w-3" />
                    <span>Rank #{currentRank}</span>
                  </div>
                </>
              ) : null}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Good to see you, <span className="text-accent">{user?.name?.split(' ')[0] || user?.name}</span>.
            </h1>
          </div>

          {/* Action Buttons & Profile */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setLogModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-bold text-black transition hover:brightness-110 active:scale-95 shadow-glow"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Log Walk</span>
            </button>

            <button
              onClick={() => setWeightModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-white/20 active:scale-95"
            >
              <Scale className="h-3.5 w-3.5 text-accent" />
              <span>Log Weight</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition"
              title="Settings"
            >
              <Avatar avatarId={user?.avatar} size="xs" ring={false} />
              <Settings className="h-3.5 w-3.5 mr-0.5" />
            </button>
          </div>
        </div>
      </div>

      {busy ? (
        <div className="flex items-center justify-center rounded-2xl border border-line/60 bg-panel/50 p-12 text-white/60">
          <Loader2 className="mr-3 h-5 w-5 animate-spin text-accent" />
          Loading your dashboard...
        </div>
      ) : (
        <>
          {/* 2. Unified Overview Metrics Strip - Glowing pastel green border */}
          <div className="rounded-2xl glow-pastel-green bg-panel/75 backdrop-blur-md p-3.5 sm:p-4 mb-5 transition-all duration-300">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-y-3 gap-x-2 divide-y sm:divide-y-0 sm:divide-x divide-emerald-400/15">
              {/* Today Distance */}
              <div className="px-2 pt-1 sm:pt-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-white/40">Today Dist</div>
                <div className="mt-0.5 text-base sm:text-lg font-bold text-white">
                  {formatKm(snapshot?.todaysStats?.distanceKm)}
                </div>
              </div>

              {/* Today Duration */}
              <div className="px-2 pt-1 sm:pt-0 sm:pl-3">
                <div className="text-[10px] uppercase font-bold tracking-wider text-white/40">Today Time</div>
                <div className="mt-0.5 text-base sm:text-lg font-bold text-white">
                  {formatMinutes(snapshot?.todaysStats?.durationMinutes)}
                </div>
              </div>

              {/* Week Distance */}
              <div className="px-2 pt-1 sm:pt-0 sm:pl-3">
                <div className="text-[10px] uppercase font-bold tracking-wider text-white/40">Week Dist</div>
                <div className="mt-0.5 text-base sm:text-lg font-bold text-white">
                  {formatKm(snapshot?.weeklyStats?.distanceKm)}
                </div>
              </div>

              {/* Active Days */}
              <div className="px-2 pt-1 sm:pt-0 sm:pl-3">
                <div className="text-[10px] uppercase font-bold tracking-wider text-white/40">Active Days</div>
                <div className="mt-0.5 text-base sm:text-lg font-bold text-white">
                  {snapshot?.weeklyStats?.activeDays || 0} <span className="text-xs font-normal text-white/40">/ {snapshot?.weeklyActiveDaysTarget || 5}d</span>
                </div>
              </div>

              {/* Total Distance */}
              <div className="px-2 pt-1 sm:pt-0 sm:pl-3">
                <div className="text-[10px] uppercase font-bold tracking-wider text-white/40">Total Dist</div>
                <div className="mt-0.5 text-base sm:text-lg font-bold text-white">
                  {formatKm(snapshot?.overallStats?.distanceKm)}
                </div>
              </div>

              {/* Current Streak */}
              <div className="px-2 pt-1 sm:pt-0 sm:pl-3">
                <div className="text-[10px] uppercase font-bold tracking-wider text-white/40">Streak</div>
                <div className="mt-0.5 text-base sm:text-lg font-bold text-orange-400 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 fill-orange-400/20" />
                  <span>{snapshot?.overallStats?.currentStreak || 0}d</span>
                </div>
              </div>

              {/* Body Weight */}
              <div className="px-2 pt-1 sm:pt-0 sm:pl-3 col-span-2 sm:col-span-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-white/40">Body Weight</div>
                <div className="mt-0.5 text-base sm:text-lg font-bold text-accent flex items-baseline gap-1">
                  <span>{snapshot?.latestWeightEntry ? `${snapshot.latestWeightEntry.weightKg.toFixed(1)} kg` : '--'}</span>
                  {snapshot?.targetWeightKg != null && (
                    <span className="text-[10px] font-normal text-white/40">
                      (Goal: {Number(snapshot.targetWeightKg).toFixed(1)})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Weight & Body Tracker (Redesigned sleek component) */}
          <div className="mb-5">
            <WeightTracker
              latestWeightEntry={snapshot?.latestWeightEntry}
              weightHistory={snapshot?.weightHistory}
              targetWeightKg={snapshot?.targetWeightKg}
              onOpenLogModal={() => setWeightModalOpen(true)}
              onOpenTargetModal={() => openGoalsModal('weight')}
              onRefresh={load}
            />
          </div>

          {/* 4. Global Leaderboard - Clean list format, no bulky boxes */}
          <div className="mb-5 rounded-2xl glow-pastel-green-subtle bg-panel/70 p-4 sm:p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">Global Leaderboard</h2>
                  <p className="text-[11px] text-white/40">Ranked by total walking distance</p>
                </div>
              </div>
            </div>

            <div className="mt-1 divide-y divide-white/5">
              {leaderboard.length ? (
                leaderboard.slice(0, 5).map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between py-2.5 px-2 transition rounded-xl ${
                      entry.isCurrentUser
                        ? 'bg-accent/10 border-l-2 border-accent font-semibold'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-5 text-center text-xs font-black shrink-0 ${
                          entry.rank === 1
                            ? 'text-yellow-400'
                            : entry.rank === 2
                            ? 'text-slate-300'
                            : entry.rank === 3
                            ? 'text-amber-500'
                            : 'text-white/30'
                        }`}
                      >
                        #{entry.rank}
                      </div>

                      <Avatar avatarId={entry.avatar} size="xs" ring={entry.isCurrentUser} />

                      <div className="min-w-0">
                        <div className="truncate text-xs sm:text-sm text-white flex items-center gap-1.5">
                          <span className="font-semibold truncate">{entry.name}</span>
                          {entry.isCurrentUser && (
                            <span className="rounded bg-accent/20 px-1 py-0.2 text-[9px] font-bold text-accent">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/40">
                          {entry.activeDays} active days
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-xs sm:text-sm text-accent">
                        {formatKm(entry.totalDistanceKm)}
                      </div>
                      <div className="text-[10px] text-white/40">
                        {formatMinutes(entry.totalDurationMinutes)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-white/40">
                  No leaderboard data yet. Start walking!
                </div>
              )}
            </div>
          </div>

          {/* 5. Workouts & Goals Grid - 2 columns, clean divider lists */}
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Recent Workouts */}
            <div className="rounded-2xl glow-pastel-green-subtle bg-panel/70 p-4 sm:p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <Footprints className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Recent Workouts</h3>
                </div>
                <button
                  type="button"
                  onClick={openLogModal}
                  className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus className="h-3 w-3 stroke-[2.5]" /> Log Walk
                </button>
              </div>

              <div className="mt-1 divide-y divide-white/5 max-h-72 overflow-y-auto">
                {snapshot?.recentWorkouts?.length ? (
                  snapshot.recentWorkouts.map((workout) => {
                    const workoutDateObj = new Date(workout.date);
                    const isInvalidDate = isNaN(workoutDateObj.getTime());
                    const dateFormatted = !isInvalidDate
                      ? workoutDateObj.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'Recent';
                    const timeFormatted = !isInvalidDate
                      ? workoutDateObj.toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })
                      : '';

                    return (
                      <div
                        key={workout._id}
                        className="flex items-center justify-between py-2.5 px-2 hover:bg-white/5 transition rounded-xl"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-xs sm:text-sm text-white">
                              {dateFormatted}
                            </span>
                            {timeFormatted && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-white/50 bg-white/5 px-1.5 py-0.5 rounded">
                                <Clock className="h-2.5 w-2.5 text-accent" />
                                {timeFormatted}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-white/40 mt-0.5">
                            {formatMinutes(workout.durationMinutes)} • {Number(workout.averageSpeedKmh || 0).toFixed(1)} km/h
                          </div>
                        </div>
                        <div className="text-right font-bold text-xs sm:text-sm text-accent shrink-0 ml-3">
                          {formatKm(workout.distanceKm)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-white/40">
                    No treadmill walks recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Goals & Targets */}
            <div className="rounded-2xl glow-pastel-green-subtle bg-panel/70 p-4 sm:p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Goals & Targets</h3>
                </div>
                <button
                  type="button"
                  onClick={() => openGoalsModal('all')}
                  className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold"
                >
                  <Pencil className="h-3 w-3" /> Edit Targets
                </button>
              </div>

              <div className="mt-1 divide-y divide-white/5">
                {/* 1. Weekly Distance Target */}
                <div
                  onClick={() => openGoalsModal('distance')}
                  className="flex items-center justify-between py-2.5 px-2 hover:bg-white/5 transition rounded-xl cursor-pointer group"
                  title="Click to edit weekly distance target"
                >
                  <span className="text-xs text-white/60">Weekly distance target</span>
                  <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 group-hover:text-accent">
                    {formatKm(snapshot?.weeklyDistanceTargetKm != null ? snapshot.weeklyDistanceTargetKm : 15)}
                    <Pencil className="h-3 w-3 text-white/20 group-hover:text-accent transition" />
                  </span>
                </div>

                {/* 2. Active Days Target */}
                <div
                  onClick={() => openGoalsModal('activeDays')}
                  className="flex items-center justify-between py-2.5 px-2 hover:bg-white/5 transition rounded-xl cursor-pointer group"
                  title="Click to edit active days target"
                >
                  <span className="text-xs text-white/60">Weekly active days</span>
                  <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 group-hover:text-accent">
                    {snapshot?.weeklyActiveDaysTarget != null ? snapshot.weeklyActiveDaysTarget : 5} days
                    <Pencil className="h-3 w-3 text-white/20 group-hover:text-accent transition" />
                  </span>
                </div>

                {/* 3. Target Weight */}
                <div
                  onClick={() => openGoalsModal('weight')}
                  className="flex items-center justify-between py-2.5 px-2 hover:bg-white/5 transition rounded-xl cursor-pointer group"
                  title="Click to edit target weight"
                >
                  <span className="text-xs text-white/60">Target body weight</span>
                  <span className="font-bold text-xs sm:text-sm text-accent flex items-center gap-1.5 group-hover:underline">
                    {snapshot?.targetWeightKg != null ? `${Number(snapshot.targetWeightKg).toFixed(1)} kg` : 'Set target'}
                    <Target className="h-3.5 w-3.5" />
                  </span>
                </div>

                {/* Latest Weight */}
                <div
                  onClick={() => setWeightModalOpen(true)}
                  className="flex items-center justify-between py-2.5 px-2 hover:bg-white/5 transition rounded-xl cursor-pointer group"
                  title="Click to log current weight"
                >
                  <span className="text-xs text-white/60">Latest weigh-in</span>
                  <span className="font-bold text-xs sm:text-sm text-accent flex items-center gap-1.5 group-hover:underline">
                    {snapshot?.latestWeightEntry ? `${snapshot.latestWeightEntry.weightKg.toFixed(1)} kg` : 'Log now'}
                    <Scale className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Settings Modal (opened by clicking profile pic or Settings button) */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onUpdated={() => load()}
      />

      {/* Weight Log Modal */}
      <WeightModal
        isOpen={weightModalOpen}
        onClose={() => setWeightModalOpen(false)}
        onSuccess={load}
        currentWeight={snapshot?.latestWeightEntry?.weightKg}
      />

      {/* Edit Goals & Targets Modal */}
      <EditGoalsModal
        isOpen={goalsModalOpen}
        onClose={() => setGoalsModalOpen(false)}
        onSuccess={handleGoalsSaved}
        currentWeeklyDistanceKm={snapshot?.weeklyDistanceTargetKm}
        currentWeeklyActiveDays={snapshot?.weeklyActiveDaysTarget}
        currentTargetWeight={snapshot?.targetWeightKg}
        initialFocusField={goalsFocusField}
      />

      {/* Quick Log Workout Modal */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="fixed inset-0" onClick={() => setLogModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-line bg-panel p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Footprints className="h-5 w-5 text-accent" />
                <h3 className="font-bold text-base text-white">Log Treadmill Walk</h3>
              </div>
              <button
                type="button"
                onClick={() => setLogModalOpen(false)}
                className="rounded-xl border border-line p-1 text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {workoutError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
                {workoutError}
              </div>
            )}

            <form onSubmit={handleLogWorkout} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">
                  Distance (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  required
                  className="w-full rounded-xl border border-line bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  required
                  className="w-full rounded-xl border border-line bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent"
                />
              </div>

              {/* Workout Time & Date (Replaces Incline) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-accent" />
                    Workout Time
                  </label>
                  <input
                    type="time"
                    value={workoutTime}
                    onChange={(e) => setWorkoutTime(e.target.value)}
                    required
                    className="w-full rounded-xl border border-line bg-black/30 px-3 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-accent" />
                    Workout Date
                  </label>
                  <input
                    type="date"
                    value={workoutDate}
                    onChange={(e) => setWorkoutDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-line bg-black/30 px-3 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setLogModalOpen(false)}
                  className="flex-1 text-xs py-2.5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingWorkout}
                  className="flex-1 text-xs py-2.5"
                >
                  {submittingWorkout ? 'Saving...' : 'Save Workout'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

