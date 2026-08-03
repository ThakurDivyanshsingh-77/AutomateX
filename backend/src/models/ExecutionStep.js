import mongoose from 'mongoose';

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
      enum: ['pending', 'waiting', 'running', 'completed', 'success', 'failed', 'skipped'],
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
