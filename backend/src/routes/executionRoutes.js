import express from 'express';
import {
  getUserExecutions,
  getExecutionById,
  getExecutionDebugSnapshot,
  replayExecution,
  deleteExecutionRecord,
} from '../controllers/executionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all execution endpoints
router.use(protect);

router.get('/', getUserExecutions);
router.get('/:id', getExecutionById);
router.get('/:id/debug', getExecutionDebugSnapshot);
router.post('/:id/replay', replayExecution);
router.delete('/:id', deleteExecutionRecord);

export default router;
