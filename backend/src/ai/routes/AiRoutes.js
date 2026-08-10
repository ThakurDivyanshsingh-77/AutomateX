import { Router } from 'express';
import { AiController } from '../controllers/AiController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

// Protect all AI routes with user authentication
router.use(authMiddleware);

router.post('/generate-text', AiController.generateText);
router.post('/text/generate', AiController.generateText);

export default router;
