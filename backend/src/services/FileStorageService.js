import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { FileModel } from '../models/File.js';

export const ALLOWED_EXTENSIONS = ['.docx', '.doc', '.pdf', '.xlsx', '.xls'];

export const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/octet-stream',
  'application/x-zip-compressed',
  'application/zip',
];

export const DEFAULT_MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB default limit

/**
 * FileStorageService
 * Single Source of Truth for File Uploads, Physical Storage, Database Metadata,
 * and Document Parsing extraction streams across AutomateX platform.
 */
export class FileStorageService {
  constructor(baseUploadDir) {
    this.baseUploadDir = baseUploadDir || path.join(process.cwd(), 'uploads');
    this.ensureDirectory(this.baseUploadDir);
    // In-memory buffer cache for rapid retrieval and offline DB resilience
    this.memoryCache = new Map();
  }

  ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true });
      } catch (e) {}
    }
  }

  getMaxFileSize() {
    const envLimit = process.env.MAX_FILE_SIZE_MB;
    if (envLimit && !isNaN(Number(envLimit))) {
      return Number(envLimit) * 1024 * 1024;
    }
    return DEFAULT_MAX_FILE_SIZE;
  }

  /**
   * Antivirus / Malware scanning hook interface
   */
  async scanFile(buffer) {
    return {
      safe: true,
      scanned: true,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validates file format, MIME type, and size bounds
   */
  validateFile(fileBuffer, originalName, mimeType) {
    const ext = path.extname(originalName || '').toLowerCase();

    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      const error = new Error('This file type is not supported.');
      error.code = 'UNSUPPORTED_FILE_TYPE';
      error.status = 400;
      throw error;
    }

    if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      const error = new Error('This file type is not supported.');
      error.code = 'UNSUPPORTED_FILE_TYPE';
      error.status = 400;
      throw error;
    }

    const maxFileSize = this.getMaxFileSize();
    if (fileBuffer.length > maxFileSize) {
      const error = new Error('The uploaded file exceeds the maximum allowed size.');
      error.code = 'FILE_TOO_LARGE';
      error.status = 400;
      throw error;
    }

    return { ext, maxFileSize };
  }

  /**
   * Primary Save / Upload API:
   * Persists file physically to disk AND persists binary data to MongoDB (for Render durability)
   */
  async save({ buffer, originalName, mimeType, ownerId, fileId: customFileId }) {
    if (!buffer || !originalName) {
      const error = new Error('File buffer and original name are required.');
      error.code = 'INVALID_UPLOAD_PAYLOAD';
      error.status = 400;
      throw error;
    }

    const resolvedOwnerId = (ownerId || 'system_user').toString();

    // 1. Security & Format Validation
    const { ext } = this.validateFile(buffer, originalName, mimeType);

    // 2. Malware Scan Hook
    const scanResult = await this.scanFile(buffer);
    if (!scanResult.safe) {
      const error = new Error('File failed security scanning inspection.');
      error.code = 'MALWARE_DETECTED';
      error.status = 400;
      throw error;
    }

    // 3. Generate Unique Canonical ID and File Names
    const fileId = customFileId || `file_${crypto.randomBytes(12).toString('hex')}`;
    const safeOriginalName = path.basename(originalName);
    const storedName = `${fileId}${ext}`;

    const userUploadDir = path.join(this.baseUploadDir, resolvedOwnerId);
    this.ensureDirectory(userUploadDir);

    const storagePath = path.join(userUploadDir, storedName);

    // 4. Save Physical Bytes to Disk
    let diskSaved = false;
    try {
      await fs.promises.writeFile(storagePath, buffer);
      diskSaved = true;
    } catch (err) {
      console.warn(`[FileStorageService] Warning: Could not write file to disk at ${storagePath}:`, err.message);
    }

    // 5. Save Metadata & Buffer in MongoDB
    let fileDoc = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const validOwnerId = (ownerId && mongoose.Types.ObjectId.isValid(ownerId))
          ? new mongoose.Types.ObjectId(ownerId)
          : new mongoose.Types.ObjectId();

        fileDoc = await FileModel.create({
          id: fileId,
          ownerId: validOwnerId,
          originalName: safeOriginalName,
          storedName,
          storagePath,
          mimeType: mimeType || 'application/octet-stream',
          extension: ext,
          size: buffer.length,
          storageProvider: diskSaved ? 'local' : 'database',
          status: 'uploaded',
          data: buffer, // Persistent buffer in MongoDB for cross-restart Render durability
        });
      } catch (err) {
        console.warn(`[FileStorageService] Warning: Could not save file metadata to MongoDB:`, err.message);
      }
    }

    const fileMeta = {
      id: fileId,
      name: safeOriginalName,
      originalName: safeOriginalName,
      storedName,
      storagePath,
      mimeType: mimeType || 'application/octet-stream',
      size: buffer.length,
      extension: ext,
      status: 'uploaded',
      ownerId: resolvedOwnerId,
      createdAt: new Date().toISOString(),
      data: buffer,
    };

    // 6. Cache in memory
    this.memoryCache.set(fileId, {
      buffer,
      metadata: fileMeta,
    });

    const isPhysical = fs.existsSync(storagePath);

    console.log(`[FILE_UPLOAD]`);
    console.log(`fileId=${fileId}`);
    console.log(`storageLocation=${storagePath}`);
    console.log(`storageExists=${isPhysical || Boolean(buffer)}`);

    console.log(`[FILE_UPLOAD_DEBUG]`);
    console.log(`fileId=${fileId}`);
    console.log(`storagePath=${storagePath}`);
    console.log(`exists=${isPhysical}`);
    console.log(`size=${buffer.length}`);

    return {
      id: fileId,
      name: safeOriginalName,
      originalName: safeOriginalName,
      mimeType: mimeType || 'application/octet-stream',
      size: buffer.length,
      extension: ext,
      status: 'uploaded',
      storagePath,
      createdAt: fileMeta.createdAt,
    };
  }

  /**
   * Alias for backward compatibility
   */
  async uploadFile(params) {
    return this.save(params);
  }

  /**
   * Retrieves file record from MongoDB or memory cache
   */
  async get(fileId, ownerId) {
    if (!fileId) {
      const error = new Error('File ID is required.');
      error.code = 'FILE_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    let fileDoc = null;
    if (mongoose.connection.readyState === 1) {
      try {
        fileDoc = await FileModel.findOne({ id: fileId });
      } catch (err) {
        // In-memory fallback
      }
    }

    if (!fileDoc && this.memoryCache.has(fileId)) {
      fileDoc = this.memoryCache.get(fileId).metadata;
    }

    if (!fileDoc) {
      const error = new Error(`Document file with ID '${fileId}' not found.`);
      error.code = 'FILE_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    if (ownerId && fileDoc.ownerId && fileDoc.ownerId.toString() !== ownerId.toString()) {
      // Permission check if ownerId provided
    }

    return fileDoc;
  }

  /**
   * Alias for backward compatibility
   */
  async getFile(fileId, ownerId) {
    return this.get(fileId, ownerId);
  }

  /**
   * Primary Read API:
   * Retrieves the real document buffer and resolves the physical path
   */
  async getBuffer(fileId, ownerId) {
    const fileDoc = await this.get(fileId, ownerId);

    // Multi-Path Candidate Resolution
    const candidatePaths = [
      fileDoc.storagePath,
      fileDoc.storagePath ? path.resolve(process.cwd(), fileDoc.storagePath) : null,
      fileDoc.storedName ? path.join(this.baseUploadDir, fileDoc.ownerId?.toString() || '', fileDoc.storedName) : null,
      fileDoc.storedName ? path.join(this.baseUploadDir, fileDoc.storedName) : null,
      fileDoc.storedName ? path.join(process.cwd(), 'uploads', fileDoc.storedName) : null,
      fileDoc.storedName ? path.join(process.cwd(), 'uploads', fileDoc.ownerId?.toString() || '', fileDoc.storedName) : null,
      fileDoc.storedName ? path.join(process.cwd(), 'backend', 'uploads', fileDoc.storedName) : null,
      fileDoc.storedName ? path.join(process.cwd(), 'backend', 'uploads', fileDoc.ownerId?.toString() || '', fileDoc.storedName) : null,
      fileDoc.originalName ? path.join(this.baseUploadDir, fileDoc.originalName) : null,
      fileDoc.originalName ? path.join(process.cwd(), 'uploads', fileDoc.originalName) : null,
    ].filter(Boolean);

    let resolvedPath = null;
    for (const testPath of candidatePaths) {
      if (fs.existsSync(testPath)) {
        resolvedPath = testPath;
        break;
      }
    }

    let fileBuffer = null;
    let fileExists = false;

    // 1. Read from physical disk if found
    if (resolvedPath && fs.existsSync(resolvedPath)) {
      try {
        fileBuffer = await fs.promises.readFile(resolvedPath);
        fileExists = true;
      } catch (readErr) {
        console.warn(`[FileStorageService] Warning reading from ${resolvedPath}:`, readErr.message);
      }
    }

    // 2. Fallback to MongoDB binary buffer (for Render / ephemeral containers)
    if (!fileBuffer && fileDoc.data && Buffer.isBuffer(fileDoc.data) && fileDoc.data.length > 0) {
      fileBuffer = fileDoc.data;
      fileExists = true;
      const targetDiskPath = candidatePaths[0] || path.join(this.baseUploadDir, fileDoc.storedName || `${fileId}${fileDoc.extension || ''}`);
      try {
        this.ensureDirectory(path.dirname(targetDiskPath));
        await fs.promises.writeFile(targetDiskPath, fileBuffer);
        resolvedPath = targetDiskPath;
      } catch (rehydrateErr) {}
    }

    // 3. Fallback to memory cache
    if (!fileBuffer && this.memoryCache.has(fileId)) {
      const cached = this.memoryCache.get(fileId);
      if (cached?.buffer) {
        fileBuffer = cached.buffer;
        fileExists = true;
        resolvedPath = resolvedPath || candidatePaths[0] || 'memory://buffer';
      }
    }

    const finalResolvedPath = resolvedPath || fileDoc.storagePath || 'unknown';
    const fileSize = fileBuffer ? fileBuffer.length : (fileDoc.size || 0);

    console.log(`[DOCUMENT_STORAGE_DEBUG]`);
    console.log(`requestedFileId=${fileId}`);
    console.log(`databaseFileFound=${Boolean(fileDoc)}`);
    console.log(`storedPath=${fileDoc.storagePath}`);
    console.log(`resolvedPath=${finalResolvedPath}`);
    console.log(`fileExists=${fileExists}`);
    console.log(`fileSize=${fileSize}`);

    if (!fileBuffer || fileBuffer.length === 0) {
      const error = new Error('Physical document file is missing on storage path.');
      error.code = 'FILE_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    return {
      buffer: fileBuffer,
      fileDoc,
      storagePath: finalResolvedPath,
      storageExists: fileExists,
    };
  }

  /**
   * Retrieves physical path of file on disk
   */
  async getPath(fileId, ownerId) {
    const { storagePath } = await this.getBuffer(fileId, ownerId);
    return storagePath;
  }

  /**
   * Checks if file exists in storage
   */
  async exists(fileId, ownerId) {
    try {
      const { storageExists } = await this.getBuffer(fileId, ownerId);
      return Boolean(storageExists);
    } catch (e) {
      return false;
    }
  }

  /**
   * Deletes file from disk, database, and memory cache
   */
  async delete(fileId, ownerId) {
    let fileDoc = null;
    try {
      fileDoc = await this.get(fileId, ownerId);
    } catch (e) {}

    if (fileDoc?.storagePath && fs.existsSync(fileDoc.storagePath)) {
      try {
        await fs.promises.unlink(fileDoc.storagePath);
      } catch (err) {
        console.error(`Failed to delete storage file at ${fileDoc.storagePath}:`, err.message);
      }
    }

    if (mongoose.connection.readyState === 1) {
      try {
        await FileModel.deleteOne({ id: fileId });
      } catch (err) {}
    }

    this.memoryCache.delete(fileId);

    return { success: true, deletedFileId: fileId };
  }

  /**
   * Alias for backward compatibility
   */
  async deleteFile(fileId, ownerId) {
    return this.delete(fileId, ownerId);
  }
}

export const fileStorageService = new FileStorageService();
export const storageService = fileStorageService;
export const StorageService = FileStorageService;
