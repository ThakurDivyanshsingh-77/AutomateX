import mongoose from 'mongoose';

const executionLogSchema = new mongoose.Schema({
  nodeId: { type: String, required: true },
  nodeName: { type: String, default: '' },
  nodeType: { type: String, required: true },
  status: { type: String, enum: ['success', 'failed', 'skipped'], required: true },
  duration: { type: Number, default: 0 },
  input: { type: Object, default: {} },
  output: { type: Object, default: {} },
  error: { type: Object, default: null },
  timestamp: { type: Date, default: Date.now },
});

const executionSchema = new mongoose.Schema(
  {
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'queued', 'running', 'success', 'failed', 'cancelled'],
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
    nodesExecuted: {
      type: Number,
      default: 0,
    },
    logs: [executionLogSchema],
    error: {
      message: { type: String },
      stack: { type: String },
      nodeId: { type: String },
    },
    output: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Execution = mongoose.model('Execution', executionSchema);
