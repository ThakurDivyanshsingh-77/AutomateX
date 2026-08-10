import express from 'express';
import {
  generateWorkflow,
  explainWorkflow,
  optimizeWorkflow,
  fixWorkflow,
} from '../controllers/aiController.js';
import { AiController } from '../ai/controllers/AiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all AI routes with JWT authentication
router.use(protect);

router.post('/generate', generateWorkflow);
router.post('/explain', explainWorkflow);
router.post('/optimize', optimizeWorkflow);
router.post('/fix', fixWorkflow);

router.post('/generate-text', AiController.generateText);
router.post('/text/generate', AiController.generateText);

export default router;
