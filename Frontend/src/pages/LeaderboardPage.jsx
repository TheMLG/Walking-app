import { useEffect, useState } from 'react';
import api from '../services/api';
import { Card } from '../components/ui';

const periods = [
  ['all', 'All time'],
  ['today', 'Today'],
  ['week', 'This week'],
  ['month', 'This month']
];

const metrics = [
  ['distance', 'Distance'],
  ['duration', 'Duration'],
  ['sessions', 'Sessions'],
  ['activeDays', 'Active days']
];

export function LeaderboardPage() {
  const [period, setPeriod] = useState('all');
  const [metric, setMetric] = useState('distance');
  const [data, setData] = useState({ leaderboard: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/api/leaderboard', { params: { period, metric } })
      .then((response) => setData(response.data))
      .finally(() => setLoading(false));
  }, [period, metric]);

  function displayValue(entry) {
    if (metric === 'duration') return `${Math.round(entry.totalDurationMinutes)} min`;
    if (metric === 'sessions') return `${entry.sessions} sessions`;
    if (metric === 'activeDays') return `${entry.activeDays} days`;
    return `${Number(entry.totalDistanceKm).toFixed(1)} km`;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8">
      <div className="mb-8">
        <div className="text-sm uppercase tracking-[0.25em] text-accent/70">WalkWar leaderboard</div>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Everyone walks. Everyone counts.</h1>
        <p className="mt-3 text-white/60">All registered users are ranked from their real workout history.</p>
      </div>

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {periods.map(([value, label]) => (
              <button key={value} onClick={() => setPeriod(value)} className={`rounded-xl px-3 py-2 text-sm transition ${period === value ? 'bg-accent text-black' : 'bg-white/5 text-white/65 hover:bg-white/10'}`}>
                {label}
              </button>
            ))}
          </div>
          <select value={metric} onChange={(event) => setMetric(event.target.value)} className="rounded-xl border border-line bg-panel2 px-3 py-2 text-sm text-white outline-none">
            {metrics.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        <div className="mt-6 space-y-3">
          {loading ? <div className="py-8 text-center text-white/50">Loading leaderboard...</div> : null}
          {!loading && data.leaderboard.length === 0 ? <div className="py-8 text-center text-white/50">No registered users yet.</div> : null}
          {!loading && data.leaderboard.map((entry) => (
            <div key={entry.userId} className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${entry.isCurrentUser ? 'border-accent/50 bg-accent/10' : 'border-line bg-black/20'}`}>
              <div className="flex items-center gap-4">
                <div className="w-8 text-center text-lg font-black text-white/45">#{entry.rank}</div>
                <div>
                  <div className="font-semibold">{entry.name} {entry.isCurrentUser ? <span className="text-xs text-accent">(you)</span> : null}</div>
                  <div className="text-sm text-white/45">{entry.sessions} sessions · {entry.activeDays} active days</div>
                </div>
              </div>
              <div className="font-bold text-accent">{displayValue(entry)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
