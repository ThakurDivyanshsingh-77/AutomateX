import { fileStorageService } from '../services/FileStorageService.js';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE_PROVIDED',
          message: 'No document file was uploaded.',
        },
      });
    }

    const ownerId = req.user?._id || req.user?.id;
    if (!ownerId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required.',
        },
      });
    }

    const fileResult = await fileStorageService.uploadFile({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      ownerId,
    });

    return res.status(200).json({
      success: true,
      file: fileResult,
    });
  } catch (error) {
    console.error('[FileController] Upload error:', error);

    const statusCode = error.status || 400;
    const errorCode = error.code || 'FILE_UPLOAD_FAILED';
    const message = error.message || 'The document could not be uploaded.';

    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message,
      },
    });
  }
};

export const getFileMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user?._id || req.user?.id;

    const fileDoc = await fileStorageService.getFile(id, ownerId);

    return res.status(200).json({
      success: true,
      file: {
        id: fileDoc.id,
        name: fileDoc.originalName,
        originalName: fileDoc.originalName,
        mimeType: fileDoc.mimeType,
        size: fileDoc.size,
        extension: fileDoc.extension,
        status: fileDoc.status,
        createdAt: fileDoc.createdAt,
      },
    });
  } catch (error) {
    console.error('[FileController] Get metadata error:', error);
    const statusCode = error.status || 400;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FILE_FETCH_FAILED',
        message: error.message || 'Failed to fetch document metadata.',
      },
    });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user?._id || req.user?.id;

    const result = await fileStorageService.deleteFile(id, ownerId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[FileController] Delete file error:', error);
    const statusCode = error.status || 400;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FILE_DELETE_FAILED',
        message: error.message || 'The document could not be deleted.',
      },
    });
  }
};
