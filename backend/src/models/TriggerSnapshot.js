import mongoose from 'mongoose';

const triggerSnapshotSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
      index: true,
    },
    nodeId: {
      type: String,
      required: true,
      index: true,
    },
    spreadsheetId: {
      type: String,
      required: true,
    },
    worksheetTitle: {
      type: String,
      default: 'Sheet1',
    },
    triggerEvent: {
      type: String,
      enum: ['newRow', 'updatedRow', 'anyChange', 'NEW_ROW', 'UPDATED_ROW', 'ANY_CHANGE'],
      default: 'newRow',
    },
    rowCount: {
      type: Number,
      default: 0,
    },
    rows: {
      type: Array,
      default: [],
    },
    lastPolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookup of a specific trigger node snapshot
triggerSnapshotSchema.index({ workflowId: 1, nodeId: 1 }, { unique: true });

export const TriggerSnapshot = mongoose.model('TriggerSnapshot', triggerSnapshotSchema);
