import { BaseExecutor } from './BaseExecutor.js';
import { FileModel } from '../../models/File.js';
import { normalizeFileId } from '../../utils/fileUtils.js';

export class FileUploadExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    const fileId = normalizeFileId(config.fileId || config.file?.id || config.file);

    if (!fileId && !config.file) {
      throw new Error('No document file attached to this File Upload node.');
    }

    let fileData = null;

    if (fileId) {
      try {
        const dbFile = await FileModel.findOne({ id: fileId });
        if (dbFile) {
          fileData = {
            id: dbFile.id,
            name: dbFile.originalName,
            originalName: dbFile.originalName,
            mimeType: dbFile.mimeType,
            size: dbFile.size,
            extension: dbFile.extension,
            status: dbFile.status,
          };
        }
      } catch (err) {
        console.warn(`[FileUploadExecutor] Error fetching file ${fileId} from DB:`, err.message);
      }
    }

    if (!fileData && config.file) {
      fileData = {
        id: config.file.id || fileId,
        name: config.file.name || config.file.originalName || 'document',
        originalName: config.file.originalName || config.file.name || 'document',
        mimeType: config.file.mimeType || 'application/octet-stream',
        size: config.file.size || 0,
        extension: config.file.extension || '.docx',
        status: config.file.status || 'uploaded',
      };
    }

    if (!fileData) {
      throw new Error(`Uploaded document file with ID '${fileId}' was not found.`);
    }

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
