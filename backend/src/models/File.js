import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    storagePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    extension: { type: String, required: true },
    size: { type: Number, required: true },
    storageProvider: { type: String, default: 'local' },
    status: { type: String, default: 'uploaded' },
    metadata: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

export const FileModel = mongoose.model('File', fileSchema);
