import { useEffect, useState } from 'react';
import api from '../services/api';
import { Card } from '../components/ui';
import { Avatar } from '../components/Avatar';

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
    <div className="mx-auto max-w-5xl px-4 py-4 sm:py-6 lg:px-8">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.25em] text-accent/70 font-semibold">Walkin' Bros leaderboard</div>
        <h1 className="mt-1 text-3xl sm:text-4xl font-black tracking-tight text-white">Everyone walks. Everyone counts.</h1>
        <p className="mt-1 text-xs sm:text-sm text-white/60">All registered users ranked by real treadmill history.</p>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {periods.map(([value, label]) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  period === value
                    ? 'bg-accent text-black shadow-sm'
                    : 'bg-white/5 text-white/65 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            value={metric}
            onChange={(event) => setMetric(event.target.value)}
            className="rounded-xl border border-line bg-panel2 px-3 py-2 text-xs text-white outline-none focus:border-accent"
          >
            {metrics.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 space-y-2.5">
          {loading ? <div className="py-8 text-center text-xs text-white/50">Loading leaderboard...</div> : null}
          {!loading && data.leaderboard.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/50">No registered users yet.</div>
          ) : null}
          {!loading &&
            data.leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center justify-between rounded-2xl border px-3.5 py-3 transition ${
                  entry.isCurrentUser
                    ? 'border-accent/60 bg-accent/10 shadow-glow'
                    : 'border-line bg-black/20 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-6 text-center text-xs sm:text-sm font-black ${
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
                  <Avatar avatarId={entry.avatar} size="sm" ring={entry.isCurrentUser} />
                  <div className="min-w-0">
                    <div className="font-semibold text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                      <span className="truncate">{entry.name}</span>
                      {entry.isCurrentUser ? (
                        <span className="rounded bg-accent/20 px-1.5 py-0.2 text-[10px] font-bold text-accent">
                          You
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[11px] text-white/45 truncate">
                      {entry.sessions} sessions · {entry.activeDays} active days
                    </div>
                  </div>
                </div>
                <div className="font-bold text-xs sm:text-sm text-accent shrink-0 ml-2">
                  {displayValue(entry)}
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}

