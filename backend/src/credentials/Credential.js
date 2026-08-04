import mongoose from 'mongoose';

const credentialSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Credential name is required'],
      trim: true,
    },
    service: {
      type: String,
      enum: ['mongodb', 'mysql', 'postgres', 'gmail', 'slack', 'discord', 'telegram', 'github', 'openai', 'http', 'custom'],
      required: true,
      index: true,
    },
    authType: {
      type: String,
      enum: ['uri', 'apiKey', 'bearerToken', 'basicAuth', 'oauth2', 'custom'],
      required: true,
    },
    encryptedData: {
      type: String,
      required: true,
      select: false, // Never return in normal queries
    },
    maskedValue: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Credential = mongoose.model('Credential', credentialSchema);
