import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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

export class FileStorageService {
  constructor(baseUploadDir) {
    this.baseUploadDir = baseUploadDir || path.join(process.cwd(), 'uploads');
    this.ensureDirectory(this.baseUploadDir);
  }

  ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
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
    // Modular hook interface for future virus scanning integration (e.g. ClamAV / AWS GuardDuty / VirusTotal API)
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
   * Uploads and persists file securely
   */
  async uploadFile({ buffer, originalName, mimeType, ownerId }) {
    if (!buffer || !originalName || !ownerId) {
      const error = new Error('File buffer, original name, and owner ID are required.');
      error.code = 'INVALID_UPLOAD_PAYLOAD';
      error.status = 400;
      throw error;
    }

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

    // 3. Generate Safe Unique ID and Storage Key
    const fileId = `file_${crypto.randomBytes(12).toString('hex')}`;
    const safeOriginalName = path.basename(originalName);
    const storedName = `${fileId}${ext}`;

    const userUploadDir = path.join(this.baseUploadDir, ownerId.toString());
    this.ensureDirectory(userUploadDir);

    const storagePath = path.join(userUploadDir, storedName);

    // 4. Save to Disk
    await fs.promises.writeFile(storagePath, buffer);

    // 5. Store Metadata in MongoDB
    const fileDoc = await FileModel.create({
      id: fileId,
      ownerId,
      originalName: safeOriginalName,
      storedName,
      storagePath,
      mimeType: mimeType || 'application/octet-stream',
      extension: ext,
      size: buffer.length,
      storageProvider: 'local',
      status: 'uploaded',
    });

    return {
      id: fileDoc.id,
      name: fileDoc.originalName,
      originalName: fileDoc.originalName,
      mimeType: fileDoc.mimeType,
      size: fileDoc.size,
      extension: fileDoc.extension,
      status: fileDoc.status,
      createdAt: fileDoc.createdAt,
    };
  }

  /**
   * Retrieves file metadata & verifies owner isolation
   */
  async getFile(fileId, ownerId) {
    const fileDoc = await FileModel.findOne({ id: fileId });

    if (!fileDoc) {
      const error = new Error('Document file not found.');
      error.code = 'FILE_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    if (ownerId && fileDoc.ownerId.toString() !== ownerId.toString()) {
      const error = new Error('You do not have permission to access this file.');
      error.code = 'UNAUTHORIZED_ACCESS';
      error.status = 403;
      throw error;
    }

    return fileDoc;
  }

  /**
   * Deletes file securely from disk and database
   */
  async deleteFile(fileId, ownerId) {
    const fileDoc = await this.getFile(fileId, ownerId);

    if (fs.existsSync(fileDoc.storagePath)) {
      try {
        await fs.promises.unlink(fileDoc.storagePath);
      } catch (err) {
        console.error(`Failed to delete storage file at ${fileDoc.storagePath}:`, err.message);
      }
    }

    await FileModel.deleteOne({ id: fileId });

    return { success: true, deletedFileId: fileId };
  }
}

export const fileStorageService = new FileStorageService();
