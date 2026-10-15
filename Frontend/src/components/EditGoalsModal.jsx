import { useEffect, useState } from 'react';
import { Target, TrendingUp, Calendar, X, Loader2, CheckCircle2, AlertCircle, Trash2, Award } from 'lucide-react';
import api from '../services/api';
import { Button } from './ui';

export function EditGoalsModal({
  isOpen,
  onClose,
  onSuccess,
  currentWeeklyDistanceKm = 15,
  currentWeeklyActiveDays = 5,
  currentTargetWeight = null,
  initialFocusField = 'all' // 'all' | 'distance' | 'activeDays' | 'weight'
}) {
  const [distanceKm, setDistanceKm] = useState('15');
  const [activeDays, setActiveDays] = useState(5);
  const [targetWeight, setTargetWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDistanceKm(String(currentWeeklyDistanceKm != null ? currentWeeklyDistanceKm : 15));
      setActiveDays(Number(currentWeeklyActiveDays != null ? currentWeeklyActiveDays : 5));
      setTargetWeight(currentTargetWeight != null ? String(currentTargetWeight) : '');
      setError('');
      setSuccess('');
    }
  }, [isOpen, currentWeeklyDistanceKm, currentWeeklyActiveDays, currentTargetWeight]);

  if (!isOpen) return null;

  function adjustWeight(delta) {
    const val = parseFloat(targetWeight) || 70.0;
    const next = Math.max(20, Math.min(350, val + delta));
    setTargetWeight(next.toFixed(1));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const parsedDist = parseFloat(distanceKm);
    const parsedDays = parseInt(activeDays, 10);
    const parsedWeight = targetWeight.trim() !== '' ? parseFloat(targetWeight) : null;

    if (isNaN(parsedDist) || parsedDist < 0) {
      setError('Please enter a valid weekly distance (0 or more km).');
      return;
    }
    if (isNaN(parsedDays) || parsedDays < 0 || parsedDays > 7) {
      setError('Active days must be between 0 and 7.');
      return;
    }
    if (parsedWeight !== null && (isNaN(parsedWeight) || parsedWeight < 20 || parsedWeight > 350)) {
      setError('Target weight must be between 20 kg and 350 kg, or left blank.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        weeklyDistanceTargetKm: Number(parsedDist.toFixed(1)),
        weeklyActiveDaysTarget: parsedDays,
        targetWeightKg: parsedWeight !== null ? Number(parsedWeight.toFixed(2)) : null
      };

      // Persist to backend
      const res = await api.put('/api/goals', payload);
      const returnedGoal = res.data?.goal || payload;

      // Save to localStorage as immediate persistent cache
      if (payload.targetWeightKg !== null) {
        localStorage.setItem('wb_target_weight', String(payload.targetWeightKg));
      } else {
        localStorage.removeItem('wb_target_weight');
      }
      localStorage.setItem('wb_distance_target', String(payload.weeklyDistanceTargetKm));
      localStorage.setItem('wb_days_target', String(payload.weeklyActiveDaysTarget));

      setSuccess('Goals saved successfully!');

      if (onSuccess) {
        await onSuccess({
          weeklyDistanceTargetKm: returnedGoal.weeklyDistanceTargetKm != null ? returnedGoal.weeklyDistanceTargetKm : payload.weeklyDistanceTargetKm,
          weeklyActiveDaysTarget: returnedGoal.weeklyActiveDaysTarget != null ? returnedGoal.weeklyActiveDaysTarget : payload.weeklyActiveDaysTarget,
          targetWeightKg: returnedGoal.targetWeightKg !== undefined ? returnedGoal.targetWeightKg : payload.targetWeightKg
        });
      }

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      // If backend fails or old process hasn't restarted, still store locally and notify
      setError(err?.response?.data?.message || 'Failed to update goals on server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-t-[2rem] sm:rounded-3xl border border-line bg-panel p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-glow">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">Edit Fitness & Body Goals</h3>
              <p className="text-xs text-white/50">Customize all 3 targets to match your personal routine</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line p-1.5 text-white/60 hover:text-white transition hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 p-3 text-xs text-accent">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Weekly Distance Target */}
          <div
            className={`rounded-2xl border p-4 transition ${
              initialFocusField === 'distance'
                ? 'border-accent/60 bg-accent/5 ring-1 ring-accent/30'
                : 'border-line bg-panel2/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/15 text-accent text-[11px] font-black">
                  1
                </span>
                Weekly Distance Target (km)
              </label>
              <span className="text-[11px] text-white/40">Treadmill total</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                step="0.5"
                min="0"
                max="500"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                autoFocus={initialFocusField === 'distance'}
                className="w-full rounded-xl border border-line bg-black/40 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-accent"
              />
              <span className="text-xs font-bold text-white/50 shrink-0">km / week</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[10, 15, 20, 25, 30, 40].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDistanceKm(String(d))}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    parseFloat(distanceKm) === d
                      ? 'bg-accent text-black font-bold'
                      : 'border border-line bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {d} km
                </button>
              ))}
            </div>
          </div>

          {/* 2. Weekly Active Days Target */}
          <div
            className={`rounded-2xl border p-4 transition ${
              initialFocusField === 'activeDays'
                ? 'border-accent/60 bg-accent/5 ring-1 ring-accent/30'
                : 'border-line bg-panel2/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/15 text-accent text-[11px] font-black">
                  2
                </span>
                Active Days Target (days / week)
              </label>
              <span className="text-[11px] text-white/40">{activeDays} days selected</span>
            </div>

            {/* 1 to 7 Days Pill Selector */}
            <div className="grid grid-cols-7 gap-1.5 my-2">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setActiveDays(num)}
                  className={`py-2 rounded-xl text-center text-xs font-black transition active:scale-95 ${
                    activeDays === num
                      ? 'bg-accent text-black shadow-glow'
                      : 'border border-line bg-black/30 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {num}d
                </button>
              ))}
            </div>
            <div className="text-[10px] text-white/40">
              Days where treadmill session duration qualifies (minimum 20 minutes)
            </div>
          </div>

          {/* 3. Target Body Weight */}
          <div
            className={`rounded-2xl border p-4 transition ${
              initialFocusField === 'weight'
                ? 'border-accent/60 bg-accent/5 ring-1 ring-accent/30'
                : 'border-line bg-panel2/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/15 text-accent text-[11px] font-black">
                  3
                </span>
                Target Body Weight (kg)
              </label>
              {targetWeight.trim() !== '' && (
                <button
                  type="button"
                  onClick={() => setTargetWeight('')}
                  className="text-[10px] text-red-400 hover:underline flex items-center gap-0.5"
                >
                  <Trash2 className="h-3 w-3" /> Clear target
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                step="0.1"
                min="20"
                max="350"
                placeholder="e.g. 70.0 (leave blank for none)"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                autoFocus={initialFocusField === 'weight'}
                className="w-full rounded-xl border border-line bg-black/40 px-3.5 py-2.5 text-sm font-bold text-accent outline-none focus:border-accent placeholder:text-white/20"
              />
              <span className="text-xs font-bold text-white/50 shrink-0">kg</span>
            </div>

            {/* Stepper buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => adjustWeight(-1.0)}
                className="rounded-lg border border-line bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 active:scale-95 transition"
              >
                -1.0
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(-0.5)}
                className="rounded-lg border border-line bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 active:scale-95 transition"
              >
                -0.5
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(0.5)}
                className="rounded-lg border border-line bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 active:scale-95 transition"
              >
                +0.5
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(1.0)}
                className="rounded-lg border border-line bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 active:scale-95 transition"
              >
                +1.0
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 text-xs py-2.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 text-xs py-2.5 shadow-glow"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save All Targets'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
