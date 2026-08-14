import { BaseExecutor } from './BaseExecutor.js';
import { fileStorageService, storageService } from '../../services/FileStorageService.js';
import { normalizeFileId } from '../../utils/fileUtils.js';

export class FileUploadExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    const rawFileId = config.fileId || config.file?.id || config.file;
    const fileId = normalizeFileId(rawFileId);
    const ownerId = context?.user?._id || context?.user?.id || context?.ownerId;

    if (!fileId && !config.file) {
      throw new Error('No document file attached to this File Upload node.');
    }

    let fileData = null;
    let storagePath = 'unknown';
    let storageExists = false;

    // 1. If buffer or file content was provided directly in config (e.g. test or direct upload node)
    if (config.file && (config.file.buffer || config.file.data)) {
      try {
        const saved = await storageService.save({
          buffer: Buffer.isBuffer(config.file.buffer || config.file.data)
            ? (config.file.buffer || config.file.data)
            : Buffer.from(config.file.buffer || config.file.data),
          originalName: config.file.name || config.file.originalName || 'document.pdf',
          mimeType: config.file.mimeType || 'application/pdf',
          ownerId,
          fileId: fileId || undefined,
        });
        fileData = saved;
        storagePath = saved.storagePath;
        storageExists = true;
      } catch (err) {
        console.warn('[FileUploadExecutor] Direct save error:', err.message);
      }
    }

    // 2. Lookup via unified StorageService
    if (!fileData && fileId) {
      try {
        const fileDoc = await storageService.get(fileId, ownerId);
        if (fileDoc) {
          fileData = {
            id: fileDoc.id,
            name: fileDoc.originalName || fileDoc.name,
            originalName: fileDoc.originalName || fileDoc.name,
            mimeType: fileDoc.mimeType,
            size: fileDoc.size,
            extension: fileDoc.extension,
            status: fileDoc.status || 'uploaded',
          };
          storagePath = fileDoc.storagePath || 'managed://storage';
          storageExists = await storageService.exists(fileId, ownerId);
        }
      } catch (err) {
        console.warn(`[FileUploadExecutor] StorageService.get warning for ${fileId}:`, err.message);
      }
    }

    // 3. Fallback to attached metadata in config
    if (!fileData && config.file) {
      fileData = {
        id: config.file.id || fileId,
        name: config.file.name || config.file.originalName || 'document',
        originalName: config.file.originalName || config.file.name || 'document',
        mimeType: config.file.mimeType || 'application/octet-stream',
        size: config.file.size || 0,
        extension: config.file.extension || '.pdf',
        status: config.file.status || 'uploaded',
        storagePath: config.file.storagePath,
      };
      storagePath = config.file.storagePath || 'client://metadata';
      storageExists = Boolean(config.file.id);

      if (fileData.id) {
        fileStorageService.memoryCache.set(fileData.id, {
          buffer: config.file.buffer || null,
          metadata: fileData,
        });
      }
    }

    if (!fileData) {
      throw new Error(`Uploaded document file with ID '${fileId}' was not found.`);
    }

    // Output required debug logs
    console.log(`[FILE_UPLOAD]`);
    console.log(`fileId=${fileData.id}`);
    console.log(`storageLocation=${storagePath}`);
    console.log(`storageExists=${storageExists}`);

    console.log(`[FILE_UPLOAD_DEBUG]`);
    console.log(`fileId=${fileData.id}`);
    console.log(`storagePath=${storagePath}`);
    console.log(`exists=${storageExists}`);
    console.log(`size=${fileData.size || 0}`);

    const formattedSize = fileData.size
      ? `${(fileData.size / 1024).toFixed(1)} KB`
      : '0 KB';
    const displayExt = (fileData.extension || '').replace('.', '').toUpperCase() || 'FILE';

    console.log(`[FileUploadExecutor] Successfully executed node ${node.id}:`);
    console.log(`  File: ${fileData.name} (${displayExt})`);
    console.log(`  Size: ${formattedSize}`);
    console.log(`  ID: ${fileData.id}`);

    return {
      success: true,
      file: {
        id: fileData.id,
        name: fileData.name,
        originalName: fileData.originalName,
        mimeType: fileData.mimeType,
        size: fileData.size,
        extension: fileData.extension,
        status: fileData.status,
      },
      fileId: fileData.id,
      fileName: fileData.name,
      mimeType: fileData.mimeType,
      size: fileData.size,
    };
  }
}
