import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    distanceKm: { type: Number, required: true, min: 0.01 },
    averageSpeedKmh: { type: Number, required: true, min: 0 },
    incline: { type: Number, default: null },
    caloriesBurned: { type: Number, default: null },
    weightAfterWorkoutKg: { type: Number, default: null },
    notes: { type: String, trim: true, maxlength: 500, default: '' }
  },
  { timestamps: true }
);

workoutSchema.index({ userId: 1, date: -1 });
export const Workout = mongoose.model('Workout', workoutSchema);
