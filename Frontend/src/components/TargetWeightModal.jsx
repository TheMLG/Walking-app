import { useEffect, useState } from 'react';
import { Target, X, Loader2, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Button } from './ui';

export function TargetWeightModal({
  isOpen,
  onClose,
  onSuccess,
  currentTargetWeight = null,
  weeklyDistanceTargetKm = 0,
  weeklyActiveDaysTarget = 0
}) {
  const [targetKg, setTargetKg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTargetKg(currentTargetWeight != null ? String(currentTargetWeight) : '');
      setError('');
      setSuccess('');
    }
  }, [isOpen, currentTargetWeight]);

  if (!isOpen) return null;

  function adjustTarget(delta) {
    const val = parseFloat(targetKg) || currentTargetWeight || 70.0;
    const next = Math.max(20, Math.min(350, val + delta));
    setTargetKg(next.toFixed(1));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const parsedTarget = parseFloat(targetKg);
    if (targetKg !== '' && (!parsedTarget || parsedTarget < 20 || parsedTarget > 350)) {
      setError('Please enter a target weight between 20 kg and 350 kg, or clear it.');
      return;
    }

    setSubmitting(true);
    try {
      await api.put('/api/goals', {
        weeklyDistanceTargetKm: Number(weeklyDistanceTargetKm) || 0,
        weeklyActiveDaysTarget: Number(weeklyActiveDaysTarget) || 0,
        targetWeightKg: targetKg !== '' ? Number(parsedTarget.toFixed(2)) : null
      });

      setSuccess('Target weight updated!');
      if (onSuccess) {
        await onSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save target weight.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveTarget() {
    setSubmitting(true);
    setError('');
    try {
      await api.put('/api/goals', {
        weeklyDistanceTargetKm: Number(weeklyDistanceTargetKm) || 0,
        weeklyActiveDaysTarget: Number(weeklyActiveDaysTarget) || 0,
        targetWeightKg: null
      });
      setSuccess('Target weight removed!');
      if (onSuccess) {
        await onSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove target weight.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-t-[2rem] sm:rounded-3xl border border-line bg-panel p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-glow">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">Target Weight Goal</h3>
              <p className="text-xs text-white/50">Set your dream body weight milestone</p>
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
          <div className="rounded-2xl border border-line bg-panel2/60 p-4 text-center">
            <label className="block text-xs uppercase tracking-wider font-semibold text-white/50 mb-2">
              Target Weight (kg)
            </label>

            <div className="flex items-center justify-center gap-2 my-2">
              <input
                type="number"
                step="0.1"
                min="20"
                max="350"
                placeholder="70.0"
                value={targetKg}
                onChange={(e) => setTargetKg(e.target.value)}
                autoFocus
                className="w-36 text-center text-3xl font-black text-accent bg-transparent border-b-2 border-accent/50 outline-none pb-1 focus:border-accent placeholder:text-white/20"
              />
              <span className="text-lg font-bold text-white/60">kg</span>
            </div>

            {/* Quick Adjustment Pills */}
            <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => adjustTarget(-1.0)}
                className="rounded-lg border border-line bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 active:scale-95 transition"
              >
                -1.0
              </button>
              <button
                type="button"
                onClick={() => adjustTarget(-0.5)}
                className="rounded-lg border border-line bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 active:scale-95 transition"
              >
                -0.5
              </button>
              <button
                type="button"
                onClick={() => adjustTarget(0.5)}
                className="rounded-lg border border-line bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 active:scale-95 transition"
              >
                +0.5
              </button>
              <button
                type="button"
                onClick={() => adjustTarget(1.0)}
                className="rounded-lg border border-line bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 active:scale-95 transition"
              >
                +1.0
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 pt-2">
            {currentTargetWeight != null && (
              <button
                type="button"
                onClick={handleRemoveTarget}
                disabled={submitting}
                className="rounded-xl border border-red-500/30 p-2.5 text-xs text-red-400 hover:bg-red-500/10 transition"
                title="Remove target goal"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
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
                'Save Target'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
