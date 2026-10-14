import { useEffect, useState } from 'react';
import api from '../services/api';
import { Button, Card } from '../components/ui';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../context/AuthContext';

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

  async function load() {
    setBusy(true);
    try {
      const response = await api.get('/api/dashboard');
      setSnapshot(response.data);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const leaderboard = snapshot?.leaderboard || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.25em] text-accent/70">WalkWar dashboard</div>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Good to see you, {user?.name}.</h1>
          <p className="mt-3 max-w-2xl text-white/60">Track your treadmill sessions, keep the streak alive, and see how you compare with everyone.</p>
        </div>
        <Button className="md:w-auto">Log Workout</Button>
      </div>

      {busy ? (
        <div className="rounded-3xl border border-line bg-panel p-6 text-white/60">Loading your dashboard...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Today distance" value={formatKm(snapshot?.todaysStats?.distanceKm)} />
            <StatCard label="Today duration" value={formatMinutes(snapshot?.todaysStats?.durationMinutes)} />
            <StatCard label="Week distance" value={formatKm(snapshot?.weeklyStats?.distanceKm)} />
            <StatCard label="Week active days" value={snapshot?.weeklyStats?.activeDays || 0} />
            <StatCard label="Total distance" value={formatKm(snapshot?.overallStats?.distanceKm)} />
            <StatCard label="Current streak" value={`${snapshot?.overallStats?.currentStreak || 0} d`} />
          </div>

          <div className="mt-6">
            <Card>
              <div className="text-lg font-bold">Global leaderboard</div>
              <div className="mt-1 text-sm text-white/55">Every registered user is ranked by total distance.</div>
              <div className="mt-5 space-y-3">
                {leaderboard.length ? (
                  leaderboard.map((entry) => (
                    <div key={entry.userId} className="flex items-center justify-between rounded-2xl border border-line bg-black/20 px-4 py-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-white/45">#{entry.rank}</div>
                        <div className="font-semibold">{entry.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-accent">{formatKm(entry.totalDistanceKm)}</div>
                        <div className="text-xs text-white/45">{entry.activeDays} active days</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-line bg-black/10 p-5 text-sm text-white/50">
                    No leaderboard data yet.
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <div className="text-lg font-bold">Recent workouts</div>
              <div className="mt-4 space-y-3">
                {snapshot?.recentWorkouts?.length ? (
                  snapshot.recentWorkouts.map((workout) => (
                    <div key={workout._id} className="rounded-2xl border border-line bg-black/20 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{new Date(workout.date).toLocaleDateString()}</div>
                        <div className="text-accent">{formatKm(workout.distanceKm)}</div>
                      </div>
                      <div className="mt-1 text-sm text-white/55">
                        {formatMinutes(workout.durationMinutes)} • {Number(workout.averageSpeedKmh || 0).toFixed(1)} km/h
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-white/50">No workouts logged yet.</div>
                )}
              </div>
            </Card>

            <Card>
              <div className="text-lg font-bold">Goals and weight</div>
              <div className="mt-4 space-y-3 text-sm text-white/60">
                <div className="rounded-2xl border border-line bg-black/20 p-4">
                  Weekly goal: {formatKm(snapshot?.weeklyDistanceTargetKm || 0)}
                </div>
                <div className="rounded-2xl border border-line bg-black/20 p-4">
                  Active days goal: {snapshot?.weeklyActiveDaysTarget || 0}
                </div>
                <div className="rounded-2xl border border-line bg-black/20 p-4">
                  Latest weight entry: {snapshot?.latestWeightEntry ? `${snapshot.latestWeightEntry.weightKg} kg` : '—'}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
