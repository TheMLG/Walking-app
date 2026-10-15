import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: true },
    weeklyDistanceTargetKm: { type: Number, default: 0, min: 0 },
    weeklyActiveDaysTarget: { type: Number, default: 0, min: 0 },
    targetWeightKg: { type: Number, default: null, min: 0 }
  },
  { timestamps: true }
);

export const Goal = mongoose.model('Goal', goalSchema);
