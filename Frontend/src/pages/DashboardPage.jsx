import { useEffect, useState } from 'react';
import { Flame, Plus, Settings, Trophy, TrendingUp, Calendar, Clock, Footprints, X, Loader2 } from 'lucide-react';
import api from '../services/api';
import { Button, Card } from '../components/ui';
import { StatCard } from '../components/StatCard';
import { Avatar } from '../components/Avatar';
import { SettingsModal } from '../components/SettingsModal';
import { useAuth } from '../context/AuthContext';
import { getAvatarPreset } from '../data/avatarPresets';

function formatKm(value) {
  return `${Number(value || 0).toFixed(1)} km`;
}

function formatMinutes(value) {
  return `${Math.round(Number(value || 0))} min`;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [busy, setBusy] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Quick Workout Log Modal state
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [distanceKm, setDistanceKm] = useState('3.0');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [incline, setIncline] = useState('1.0');
  const [submittingWorkout, setSubmittingWorkout] = useState(false);
  const [workoutError, setWorkoutError] = useState('');

  async function load() {
    setBusy(true);
    try {
      const response = await api.get('/api/dashboard');
      setSnapshot(response.data);
    } catch (err) {
      console.error('Failed to load dashboard snapshot', err);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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
      await api.post('/api/workouts', {
        date: new Date().toISOString(),
        distanceKm: dist,
        durationMinutes: dur,
        incline: incline ? parseFloat(incline) : null
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
      {/* Mobile-First Header Bar */}
      <div className="mb-6 rounded-3xl border border-line bg-panel2/60 p-4 sm:p-6 backdrop-blur shadow-xl">
        <div className="flex items-center justify-between gap-3">
          {/* Left Greeting & Status */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent/80">
                WalkWar Live
              </span>
            </div>
            <h1 className="mt-1 truncate text-2xl sm:text-3xl font-black tracking-tight text-white">
              Good to see you, <span className="text-accent">{user?.name?.split(' ')[0] || user?.name}</span>.
            </h1>
            <p className="hidden sm:block mt-1 text-xs text-white/55">
              Keep the streak alive and climb the treadmill leaderboard.
            </p>
          </div>

          {/* Right: Small Profile Pic Button - opens settings on click */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="group relative flex items-center gap-2.5 rounded-2xl border border-line bg-black/40 p-1.5 sm:px-3 sm:py-2 transition hover:border-accent/50 hover:bg-white/5 active:scale-95 shadow-glow"
              title="Click to open profile settings (change username, password & avatar)"
            >
              <div className="relative">
                <Avatar avatarId={user?.avatar} size="md" ring />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-panel border border-line text-[9px] text-accent">
                  <Settings className="h-2.5 w-2.5" />
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-white group-hover:text-accent transition flex items-center gap-1">
                  <span>{user?.name}</span>
                </div>
                <div className="text-[10px] text-white/45 uppercase tracking-wider">Settings</div>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Badges and Actions Row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t border-line/60 pt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
              <Flame className="h-3.5 w-3.5 fill-orange-400/20" />
              <span>{streak} Day Streak</span>
            </div>

            {currentRank ? (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                <Trophy className="h-3.5 w-3.5" />
                <span>Rank #{currentRank}</span>
              </div>
            ) : null}

            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-line bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
              <span>{currentPreset.emoji} {currentPreset.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
            <Button
              onClick={() => setLogModalOpen(true)}
              className="flex-1 sm:flex-none text-xs py-2.5 px-4 shadow-glow"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              Log Workout
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSettingsOpen(true)}
              className="text-xs py-2.5 px-3"
            >
              <Settings className="h-3.5 w-3.5 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {busy ? (
        <div className="flex items-center justify-center rounded-3xl border border-line bg-panel p-12 text-white/60">
          <Loader2 className="mr-3 h-5 w-5 animate-spin text-accent" />
          Loading your dashboard...
        </div>
      ) : (
        <>
          {/* Stat Cards: 2 cols on mobile, 3 on tablet, 6 on desktop */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Today distance" value={formatKm(snapshot?.todaysStats?.distanceKm)} />
            <StatCard label="Today duration" value={formatMinutes(snapshot?.todaysStats?.durationMinutes)} />
            <StatCard label="Week distance" value={formatKm(snapshot?.weeklyStats?.distanceKm)} />
            <StatCard label="Week active days" value={`${snapshot?.weeklyStats?.activeDays || 0} days`} />
            <StatCard label="Total distance" value={formatKm(snapshot?.overallStats?.distanceKm)} />
            <StatCard label="Current streak" value={`${snapshot?.overallStats?.currentStreak || 0} d`} />
          </div>

          {/* Leaderboard Section */}
          <div className="mt-5">
            <Card className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    Global Leaderboard
                  </div>
                  <div className="mt-0.5 text-xs text-white/50">
                    Ranked by total walking distance.
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {leaderboard.length ? (
                  leaderboard.slice(0, 5).map((entry) => (
                    <div
                      key={entry.userId}
                      className={`flex items-center justify-between rounded-2xl border px-3.5 py-3 transition ${
                        entry.isCurrentUser
                          ? 'border-accent/60 bg-accent/10 shadow-glow'
                          : 'border-line bg-black/20 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Rank Badge */}
                        <div
                          className={`w-6 text-center text-xs font-black ${
                            entry.rank === 1
                              ? 'text-yellow-400'
                              : entry.rank === 2
                              ? 'text-slate-300'
                              : entry.rank === 3
                              ? 'text-amber-500'
                              : 'text-white/40'
                          }`}
                        >
                          #{entry.rank}
                        </div>

                        {/* Animal Avatar */}
                        <Avatar avatarId={entry.avatar} size="sm" ring={entry.isCurrentUser} />

                        {/* Name & Active Days */}
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-xs sm:text-sm text-white flex items-center gap-1.5">
                            <span className="truncate">{entry.name}</span>
                            {entry.isCurrentUser && (
                              <span className="rounded bg-accent/20 px-1.5 py-0.2 text-[10px] font-bold text-accent">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-white/45">
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
                  <div className="rounded-2xl border border-dashed border-line bg-black/10 p-5 text-center text-xs text-white/50">
                    No leaderboard data yet. Start walking!
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Workouts and Goals Grid */}
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <Footprints className="h-4 w-4 text-accent" />
                  Recent Workouts
                </div>
                <button
                  type="button"
                  onClick={() => setLogModalOpen(true)}
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>

              <div className="space-y-2.5">
                {snapshot?.recentWorkouts?.length ? (
                  snapshot.recentWorkouts.map((workout) => (
                    <div
                      key={workout._id}
                      className="flex items-center justify-between rounded-2xl border border-line bg-black/20 px-3.5 py-2.5"
                    >
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-white">
                          {new Date(workout.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-[11px] text-white/50">
                          {formatMinutes(workout.durationMinutes)} • {Number(workout.averageSpeedKmh || 0).toFixed(1)} km/h
                          {workout.incline != null ? ` • ${workout.incline}% inc` : ''}
                        </div>
                      </div>
                      <div className="text-right font-bold text-xs sm:text-sm text-accent">
                        {formatKm(workout.distanceKm)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-white/45">
                    No treadmill sessions recorded yet. Tap "Log Workout" above to begin!
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4 sm:p-5">
              <div className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                Goals & Body
              </div>
              <div className="space-y-2.5 text-xs text-white/70">
                <div className="flex items-center justify-between rounded-2xl border border-line bg-black/20 p-3">
                  <span className="text-white/60">Weekly target</span>
                  <span className="font-bold text-white">
                    {formatKm(snapshot?.weeklyDistanceTargetKm || 15)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-line bg-black/20 p-3">
                  <span className="text-white/60">Active days target</span>
                  <span className="font-bold text-white">
                    {snapshot?.weeklyActiveDaysTarget || 5} days
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-line bg-black/20 p-3">
                  <span className="text-white/60">Latest weight</span>
                  <span className="font-bold text-accent">
                    {snapshot?.latestWeightEntry ? `${snapshot.latestWeightEntry.weightKg} kg` : '70.0 kg'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Settings Modal (opened by clicking profile pic or Settings button) */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onUpdated={() => load()}
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

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">
                  Incline (%) - optional
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="30"
                  value={incline}
                  onChange={(e) => setIncline(e.target.value)}
                  className="w-full rounded-xl border border-line bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent"
                />
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
