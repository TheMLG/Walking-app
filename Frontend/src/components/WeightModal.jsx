import { useEffect, useState } from 'react';
import { Scale, Calendar, Clock, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Button } from './ui';

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

export function WeightModal({
  isOpen,
  onClose,
  onSuccess,
  currentWeight = null
}) {
  const [weightKg, setWeightKg] = useState('');
  const [weightDate, setWeightDate] = useState(getCurrentDateString());
  const [weightTime, setWeightTime] = useState(getCurrentTimeString());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setWeightKg(currentWeight ? String(currentWeight) : '70.0');
      setWeightDate(getCurrentDateString());
      setWeightTime(getCurrentTimeString());
      setError('');
      setSuccess('');
    }
  }, [isOpen, currentWeight]);

  if (!isOpen) return null;

  function adjustWeight(delta) {
    const val = parseFloat(weightKg) || 70.0;
    const next = Math.max(20, Math.min(350, val + delta));
    setWeightKg(next.toFixed(1));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const parsedWeight = parseFloat(weightKg);
    if (!parsedWeight || parsedWeight < 20 || parsedWeight > 350) {
      setError('Please enter a valid body weight between 20 kg and 350 kg.');
      return;
    }

    setSubmitting(true);
    try {
      const combinedDate = new Date(`${weightDate}T${weightTime || '12:00'}:00`);
      const finalDate = isNaN(combinedDate.getTime()) ? new Date() : combinedDate;

      await api.post('/api/weight', {
        date: finalDate.toISOString(),
        weightKg: Number(parsedWeight.toFixed(2))
      });

      setSuccess('Weight logged successfully!');
      if (onSuccess) {
        await onSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to log weight. Please try again.');
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
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">Log Weight</h3>
              <p className="text-xs text-white/50">Record your current body weight</p>
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

        {/* Error / Success Feedback */}
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
          {/* Main Weight Input with Stepper Buttons */}
          <div className="rounded-2xl border border-line bg-panel2/60 p-4 text-center">
            <label className="block text-xs uppercase tracking-wider font-semibold text-white/50 mb-2">
              Body Weight (kg)
            </label>

            <div className="flex items-center justify-center gap-2 my-2">
              <input
                type="number"
                step="0.1"
                min="20"
                max="350"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                required
                className="w-36 text-center text-3xl font-black text-accent bg-transparent border-b-2 border-accent/50 outline-none pb-1 focus:border-accent"
              />
              <span className="text-lg font-bold text-white/60">kg</span>
            </div>

            {/* Quick Adjustment Stepper Pills */}
            <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
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
                onClick={() => adjustWeight(-0.1)}
                className="rounded-lg border border-line bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 active:scale-95 transition"
              >
                -0.1
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(0.1)}
                className="rounded-lg border border-line bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 active:scale-95 transition"
              >
                +0.1
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

          {/* Date & Time Selectors */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-accent" />
                Date
              </label>
              <input
                type="date"
                value={weightDate}
                onChange={(e) => setWeightDate(e.target.value)}
                required
                className="w-full rounded-xl border border-line bg-black/30 px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-accent" />
                Time
              </label>
              <input
                type="time"
                value={weightTime}
                onChange={(e) => setWeightTime(e.target.value)}
                required
                className="w-full rounded-xl border border-line bg-black/30 px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
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
                'Save Weight'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
