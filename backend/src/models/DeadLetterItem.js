import mongoose from 'mongoose';

const deadLetterSchema = new mongoose.Schema(
  {
    // References
    executionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Execution',
      required: true,
      index: true,
    },
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workflowName: {
      type: String,
      default: 'Untitled Workflow',
    },

    // Failed node info
    failedNodeId: {
      type: String,
      default: null,
    },
    failedNodeType: {
      type: String,
      default: null,
    },

    // Original trigger payload — used for replay
    triggerPayload: {
      type: Object,
      default: {},
    },
    triggerType: {
      type: String,
      default: 'manual',
    },

    // Error details with classification
    error: {
      message: { type: String },
      stack: { type: String },
      type: { type: String, default: 'unknown' },    // ErrorHandler classification
      retryable: { type: Boolean, default: false },
      severity: { type: String, default: 'medium' },
      recommendation: { type: String },
    },

    // Total retry attempts made across all retries before landing in DLQ
    retryCount: {
      type: Number,
      default: 0,
    },

    // Lifecycle status
    status: {
      type: String,
      enum: ['dead', 'replaying', 'resolved', 'purged'],
      default: 'dead',
      index: true,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
    replayedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

deadLetterSchema.index({ ownerId: 1, createdAt: -1 });
deadLetterSchema.index({ ownerId: 1, status: 1 });

export const DeadLetterItem = mongoose.model('DeadLetterItem', deadLetterSchema);
