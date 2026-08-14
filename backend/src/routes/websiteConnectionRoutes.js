import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createWebsiteConnection,
  getWebsiteConnections,
  getWebsiteConnectionById,
  testWebsiteConnection,
  testRawWebsiteConnection,
  deleteWebsiteConnection,
} from '../controllers/websiteConnectionController.js';

const router = express.Router();

router.post('/', protect, createWebsiteConnection);
router.get('/', protect, getWebsiteConnections);
router.post('/test-raw', protect, testRawWebsiteConnection);
router.get('/:id', protect, getWebsiteConnectionById);
router.post('/:id/test', protect, testWebsiteConnection);
router.delete('/:id', protect, deleteWebsiteConnection);

export default router;
