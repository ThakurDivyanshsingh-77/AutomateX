import mongoose from 'mongoose';
import crypto from 'crypto';

const workflowSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    visibility: {
      type: String,
      enum: ['private', 'public'],
      default: 'private',
    },
    version: {
      type: Number,
      default: 1,
    },
    // ─── Phase 10: Versioning Fields ─────────────────────────────────────
    currentVersion: {
      type: String,
      default: null,  // e.g. "v1.0.0"
    },
    publishedVersion: {
      type: String,
      default: null,  // Last published semver tag
    },
    draftVersion: {
      type: String,
      default: null,  // Current in-progress draft version tag
    },
    lastPublishedAt: {
      type: Date,
      default: null,
    },
    totalVersions: {
      type: Number,
      default: 0,
    },
    // ─────────────────────────────────────────────────────────────────────
    tags: {
      type: [String],
      default: [],
    },
    webhookToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    definition: {
      type: Object,
      default: {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      },
    },
  },
  {
    timestamps: true,
  }
);

workflowSchema.pre('save', function (next) {
  if (!this.webhookToken) {
    this.webhookToken = crypto.randomBytes(16).toString('hex');
  }
  next();
});

export const Workflow = mongoose.model('Workflow', workflowSchema);
