import mongoose from 'mongoose';

const weightLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    weightKg: { type: Number, required: true, min: 1 }
  },
  { timestamps: true }
);

weightLogSchema.index({ userId: 1, date: -1 });

export const WeightLog = mongoose.model('WeightLog', weightLogSchema);
