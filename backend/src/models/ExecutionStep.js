import mongoose from 'mongoose';

const retryAttemptSchema = new mongoose.Schema({
  attemptNumber: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  delayUsed: { type: Number, default: 0 },
  status: { type: String, required: true }, // 'success' | 'recovered' | 'failed' | 'timeout'
  statusCode: { type: Number, default: null },
  error: { type: String, default: null },
  duration: { type: Number, default: 0 },
  durationMs: { type: Number, default: 0 },
});

const executionStepSchema = new mongoose.Schema(
  {
    executionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Execution',
      required: true,
      index: true,
    },
    nodeId: {
      type: String,
      required: true,
      index: true,
    },
    nodeName: {
      type: String,
      default: '',
    },
    nodeType: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'waiting', 'running', 'completed', 'success', 'recovered', 'failed', 'skipped'],
      default: 'pending',
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    finishedAt: {
      type: Date,
    },
    duration: {
      type: Number,
      default: 0,
    },
    input: {
      type: Object,
      default: {},
    },
    output: {
      type: Object,
      default: {},
    },
    error: {
      type: Object,
      default: null,
    },
    retryAttempts: [retryAttemptSchema],
    retrySummary: {
      totalAttempts: { type: Number, default: 1 },
      recovered: { type: Boolean, default: false },
      finalError: { type: String, default: null },
    },
    logs: [
      {
        step: { type: String },
        timestamp: { type: Date, default: Date.now },
        data: { type: Object },
      },
    ],
  },
  {
    timestamps: true,
  }
);

executionStepSchema.index({ executionId: 1, nodeId: 1 });

export const ExecutionStep = mongoose.model('ExecutionStep', executionStepSchema);
