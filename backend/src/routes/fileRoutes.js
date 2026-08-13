import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import { uploadFile, getFileMetadata, deleteFile } from '../controllers/fileController.js';

const router = express.Router();

// Memory storage so fileStorageService can perform security validation on buffer before writing to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // Outer boundary limit for multer stream; FileStorageService enforces fine-grained MAX_FILE_SIZE_MB limit
  },
});

router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/:id', protect, getFileMetadata);
router.delete('/:id', protect, deleteFile);

export default router;
