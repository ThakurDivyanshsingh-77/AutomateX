import express from 'express';
import {
  generateWorkflow,
  explainWorkflow,
  optimizeWorkflow,
  fixWorkflow,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all AI routes with JWT authentication
router.use(protect);

router.post('/generate', generateWorkflow);
router.post('/explain', explainWorkflow);
router.post('/optimize', optimizeWorkflow);
router.post('/fix', fixWorkflow);

export default router;
