import mongoose from 'mongoose';

const websiteConnectionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Connection name is required'],
      trim: true,
    },
    websiteUrl: {
      type: String,
      required: [true, 'Website URL is required'],
      trim: true,
    },
    apiBaseUrl: {
      type: String,
      trim: true,
      default: '',
    },
    connectionMethod: {
      type: String,
      enum: ['restApi', 'apiKey', 'bearerToken', 'basicAuth', 'browserSession'],
      default: 'restApi',
      required: true,
    },
    authType: {
      type: String,
      enum: ['none', 'apiKey', 'bearerToken', 'basicAuth', 'customHeader', 'browserCookie'],
      default: 'bearerToken',
    },
    encryptedCredentials: {
      type: String,
      required: true,
      select: false, // Never return in default queries
    },
    maskedCredentials: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    customHeaders: [
      {
        key: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],
    status: {
      type: String,
      enum: ['connected', 'error', 'untested', 'disconnected'],
      default: 'untested',
    },
    lastTestedAt: {
      type: Date,
      default: null,
    },
    lastResponseTimeMs: {
      type: Number,
      default: null,
    },
    lastError: {
      type: String,
      default: null,
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const WebsiteConnection = mongoose.model('WebsiteConnection', websiteConnectionSchema);
