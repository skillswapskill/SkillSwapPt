import mongoose from 'mongoose';

const suspiciousActivitySchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  warningCount: {
    type: Number,
    default: 1
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  evidenceFramePath: {
    type: String, // Path to stored evidence image
    required: true
  },
  actionTaken: {
    type: String,
    enum: ['warning_sent', 'final_warning', 'meeting_terminated'],
    required: true
  },
  resolved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for quick queries
suspiciousActivitySchema.index({ sessionId: 1, userId: 1 });
suspiciousActivitySchema.index({ timestamp: -1 });

export const SuspiciousActivity= mongoose.model('SuspiciousActivity', suspiciousActivitySchema);
