import { useMemo, useState } from 'react';
import {
  Scale,
  Plus,
  TrendingDown,
  TrendingUp,
  Trash2,
  Target,
  LineChart as LineChartIcon,
  History,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import api from '../services/api';

function formatDisplayDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Recent';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
}

function formatFullDateTime(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Recent';
  const datePart = d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
  const timePart = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  return `${datePart} • ${timePart}`;
}

function CustomWeightTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-white/10 bg-panel px-3 py-2 shadow-2xl backdrop-blur text-xs">
        <div className="font-medium text-white/50">{data.fullDate}</div>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className="text-base font-bold text-accent">{data.weightKg}</span>
          <span className="text-xs text-white/50">kg</span>
        </div>
        {data.changeFromStart !== undefined && (
          <div className="mt-0.5 text-[11px] text-white/40">
            vs start: <span className={data.changeFromStart < 0 ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {data.changeFromStart > 0 ? `+${data.changeFromStart.toFixed(1)}` : data.changeFromStart.toFixed(1)} kg
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export function WeightTracker({
  latestWeightEntry,
  weightHistory = [],
  targetWeightKg = null,
  onOpenLogModal,
  onOpenTargetModal,
  onRefresh
}) {
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'history'
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // Chronologically sorted weights (oldest to newest)
  const chronologicalWeights = useMemo(() => {
    return [...weightHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [weightHistory]);

  const currentWeight = latestWeightEntry?.weightKg ?? (chronologicalWeights[chronologicalWeights.length - 1]?.weightKg || null);
  const startingWeight = chronologicalWeights[0]?.weightKg || null;

  // Calculate Net Total Change
  const totalChange = useMemo(() => {
    if (currentWeight == null || startingWeight == null) return null;
    return Number((currentWeight - startingWeight).toFixed(1));
  }, [currentWeight, startingWeight]);

  // Calculate change vs previous entry
  const recentChange = useMemo(() => {
    if (chronologicalWeights.length < 2) return null;
    const prev = chronologicalWeights[chronologicalWeights.length - 2].weightKg;
    const curr = chronologicalWeights[chronologicalWeights.length - 1].weightKg;
    return Number((curr - prev).toFixed(1));
  }, [chronologicalWeights]);

  // Target progress calculation
  const targetProgress = useMemo(() => {
    if (!targetWeightKg || currentWeight == null || startingWeight == null) return null;
    const totalToLoseOrGain = Math.abs(startingWeight - targetWeightKg);
    if (totalToLoseOrGain === 0) return 100;
    const currentProgress = Math.abs(startingWeight - currentWeight);
    const pct = Math.min(100, Math.max(0, Math.round((currentProgress / totalToLoseOrGain) * 100)));
    const delta = Number((currentWeight - targetWeightKg).toFixed(1));
    return {
      percentage: pct,
      deltaKg: delta,
      isGoalReached: Math.abs(delta) <= 0.2
    };
  }, [currentWeight, startingWeight, targetWeightKg]);

  // Chart data
  const chartData = useMemo(() => {
    if (!chronologicalWeights.length) return [];
    return chronologicalWeights.map((w) => {
      const diffFromStart = startingWeight != null ? Number((w.weightKg - startingWeight).toFixed(1)) : 0;
      return {
        id: w._id,
        date: formatDisplayDate(w.date),
        fullDate: formatFullDateTime(w.date),
        weightKg: Number(w.weightKg.toFixed(1)),
        changeFromStart: diffFromStart
      };
    });
  }, [chronologicalWeights, startingWeight]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this weigh-in entry?')) return;
    setDeletingId(id);
    setDeleteError('');
    try {
      await api.delete(`/api/weight/${id}`);
      if (onRefresh) await onRefresh();
    } catch (err) {
      setDeleteError(err?.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-2xl glow-pastel-green-subtle bg-panel/70 p-4 sm:p-5 backdrop-blur-sm">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/5 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Weight & Body</span>
              {chronologicalWeights.length > 0 && (
                <span className="text-[11px] font-normal text-white/40">
                  ({chronologicalWeights.length} logs)
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {chronologicalWeights.length > 0 && (
            <div className="inline-flex rounded-lg border border-white/10 bg-black/30 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('chart')}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                  activeTab === 'chart'
                    ? 'bg-accent text-black font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Trend
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                  activeTab === 'history'
                    ? 'bg-accent text-black font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                History
              </button>
            </div>
          )}

          <button
            onClick={onOpenLogModal}
            className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-xs font-bold text-black transition hover:brightness-110 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Log</span>
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
          {deleteError}
        </div>
      )}

      {chronologicalWeights.length === 0 ? (
        /* Empty State */
        <div className="py-8 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent mb-2">
            <Scale className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium text-white/70">No weigh-ins recorded yet</p>
          <p className="text-[11px] text-white/40 mt-0.5 max-w-xs mx-auto">
            Log your body weight to track fat loss and progress alongside your walks.
          </p>
          <button
            onClick={onOpenLogModal}
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-black hover:brightness-110"
          >
            <Plus className="h-3.5 w-3.5" /> Log First Weight
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-3.5">
          {/* Streamlined Stats Row - No bulky individual cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pb-1 border-b border-white/5">
            {/* Current */}
            <div className="pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">Current</span>
                {recentChange != null && (
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-1 py-0.2 rounded ${
                      recentChange < 0
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : recentChange > 0
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-white/40'
                    }`}
                  >
                    {recentChange < 0 ? <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" /> : <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />}
                    {recentChange > 0 ? `+${recentChange}` : recentChange}
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-lg sm:text-xl font-bold text-white">
                {currentWeight != null ? currentWeight.toFixed(1) : '--'}
                <span className="text-xs font-normal text-white/40 ml-1">kg</span>
              </div>
            </div>

            {/* Starting */}
            <div className="px-2 border-l border-white/5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">Starting</span>
              <div className="mt-0.5 text-lg sm:text-xl font-bold text-white/70">
                {startingWeight != null ? startingWeight.toFixed(1) : '--'}
                <span className="text-xs font-normal text-white/40 ml-1">kg</span>
              </div>
            </div>

            {/* Target */}
            <div className="px-2 border-l border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">Target</span>
                <button
                  type="button"
                  onClick={onOpenTargetModal}
                  className="text-[10px] font-bold text-accent hover:underline"
                >
                  {targetWeightKg ? 'Edit' : '+ Set'}
                </button>
              </div>
              <div className="mt-0.5 text-lg sm:text-xl font-bold text-accent">
                {targetWeightKg ? Number(targetWeightKg).toFixed(1) : '--'}
                <span className="text-xs font-normal text-white/40 ml-1">kg</span>
              </div>
            </div>

            {/* Total Change */}
            <div className="pl-2 border-l border-white/5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">Total Change</span>
              <div
                className={`mt-0.5 text-lg sm:text-xl font-bold ${
                  totalChange != null && totalChange < 0
                    ? 'text-emerald-400'
                    : totalChange != null && totalChange > 0
                    ? 'text-amber-400'
                    : 'text-white'
                }`}
              >
                {totalChange != null ? `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)}` : '--'}
                <span className="text-xs font-normal text-white/40 ml-1">kg</span>
              </div>
            </div>
          </div>

          {/* Slim Progress Bar - No bulky card */}
          {targetProgress && (
            <div className="py-1">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-white/60 flex items-center gap-1 font-medium">
                  <Target className="h-3 w-3 text-accent" />
                  Goal Progress: <strong className="text-white">{targetProgress.percentage}%</strong>
                </span>
                <span className="text-white/40 text-[10px]">
                  {Math.abs(targetProgress.deltaKg)} kg to reach {Number(targetWeightKg).toFixed(1)} kg
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.max(3, targetProgress.percentage)}%` }}
                />
              </div>
            </div>
          )}

          {/* VIEW: Clean Chart - Direct rendering without nested card border */}
          {activeTab === 'chart' && (
            <div className="pt-1">
              {chartData.length < 2 ? (
                <div className="py-6 text-center text-xs text-white/40">
                  <p>1 weigh-in recorded ({currentWeight} kg).</p>
                  <p className="mt-0.5 text-[11px] text-white/30">
                    Log another weigh-in to display your progress curve.
                  </p>
                </div>
              ) : (
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#b3ff3c" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#b3ff3c" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.3)"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.3)"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        domain={['dataMin - 1', 'dataMax + 1']}
                        unit="kg"
                      />
                      <Tooltip content={<CustomWeightTooltip />} />
                      {targetWeightKg && (
                        <ReferenceLine
                          y={Number(targetWeightKg)}
                          stroke="#38bdf8"
                          strokeDasharray="3 3"
                          strokeOpacity={0.7}
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="weightKg"
                        stroke="#b3ff3c"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#weightGradient)"
                        dot={{ r: 3, fill: '#b3ff3c', stroke: '#0b0f14', strokeWidth: 1.5 }}
                        activeDot={{ r: 4.5, fill: '#b3ff3c', stroke: '#fff', strokeWidth: 1.5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* VIEW: Clean History List - Subtle divider lines, no nested chunky cards */}
          {activeTab === 'history' && (
            <div className="divide-y divide-white/5 max-h-56 overflow-y-auto">
              {weightHistory.map((item, index) => {
                const currentIdxInChrono = chronologicalWeights.findIndex((c) => String(c._id) === String(item._id));
                const prevChrono = currentIdxInChrono > 0 ? chronologicalWeights[currentIdxInChrono - 1] : null;
                const delta = prevChrono ? Number((item.weightKg - prevChrono.weightKg).toFixed(1)) : null;

                return (
                  <div
                    key={item._id}
                    className="flex items-center justify-between py-2 px-1 hover:bg-white/5 transition rounded-lg"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">
                          {formatFullDateTime(item.date)}
                        </span>
                        {index === 0 && (
                          <span className="rounded bg-accent/15 px-1.5 py-0.2 text-[9px] font-bold text-accent">
                            Latest
                          </span>
                        )}
                      </div>
                      {delta != null && (
                        <div className="text-[10px] text-white/40 mt-0.5">
                          vs prev:{' '}
                          <span
                            className={
                              delta < 0
                                ? 'text-emerald-400 font-semibold'
                                : delta > 0
                                ? 'text-amber-400 font-semibold'
                                : 'text-white/50'
                            }
                          >
                            {delta > 0 ? `+${delta}` : delta} kg
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-bold text-accent">
                          {item.weightKg.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-white/40 ml-0.5">kg</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        disabled={deletingId === item._id}
                        className="rounded p-1 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
