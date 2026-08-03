import mongoose from 'mongoose';

const workflowVersionSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
      index: true,
    },
    // Semver string: "v1.0.0", "v1.2.3", "v2.0.0"
    version: {
      type: String,
      required: true,
      trim: true,
    },
    // Parsed semver for sorting/comparison
    versionNumber: {
      major: { type: Number, default: 1 },
      minor: { type: Number, default: 0 },
      patch: { type: Number, default: 0 },
    },
    // Display title for this version (e.g. "Initial Release")
    title: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    // User-supplied description of this version
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    // Full workflow definition snapshot at time of this version
    definition: {
      type: Object,
      default: {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      },
    },
    // Who created this version
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // version lifecycle status
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    // Was this version created by a Restore (rollback) operation?
    isRollback: {
      type: Boolean,
      default: false,
    },
    // Semver tag of the version this was based on
    parentVersion: {
      type: String,
      default: null,
    },
    // Array of human-readable change bullet strings
    changeSummary: {
      type: [String],
      default: [],
    },
    // When this version was published (null for drafts)
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient lookups
workflowVersionSchema.index({ workflowId: 1, version: 1 }, { unique: true });
workflowVersionSchema.index({ workflowId: 1, status: 1 });
workflowVersionSchema.index({ workflowId: 1, 'versionNumber.major': -1, 'versionNumber.minor': -1, 'versionNumber.patch': -1 });

export const WorkflowVersion = mongoose.model('WorkflowVersion', workflowVersionSchema);
