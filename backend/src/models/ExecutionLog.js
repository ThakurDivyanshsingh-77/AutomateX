import mongoose from 'mongoose';
import { EXECUTION_STATUS } from '../constants/status.js';

const stepResultSchema = new mongoose.Schema({
  nodeId: { type: String, required: true },
  nodeType: { type: String, required: true },
  label: { type: String, default: '' },
  status: {
    type: String,
    enum: Object.values(EXECUTION_STATUS),
    default: EXECUTION_STATUS.PENDING
  },
  inputData: { type: mongoose.Schema.Types.Mixed, default: {} },
  outputData: { type: mongoose.Schema.Types.Mixed, default: {} },
  error: { type: String, default: null },
  durationMs: { type: Number, default: 0 },
  executedAt: { type: Date, default: Date.now }
}, { _id: false });

const executionLogSchema = new mongoose.Schema(
  {
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    status: {
      type: String,
      enum: Object.values(EXECUTION_STATUS),
      default: EXECUTION_STATUS.PENDING
    },
    triggerType: {
      type: String,
      default: 'MANUAL'
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    durationMs: {
      type: Number,
      default: 0
    },
    stepResults: [stepResultSchema],
    errorDetails: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const ExecutionLog = mongoose.model('ExecutionLog', executionLogSchema);
