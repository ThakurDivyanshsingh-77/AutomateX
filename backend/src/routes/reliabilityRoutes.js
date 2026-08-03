import express from 'express';
import {
  getReliabilityStats,
  getFailedExecutions,
  getDeadLetterQueue,
  replayDeadLetterItem,
  deleteDeadLetterItem,
  retryExecution,
  resumeExecution,
  getRecoverySummary,
} from '../controllers/reliabilityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all reliability endpoints with JWT
router.use(protect);

// Dashboard stats
router.get('/stats', getReliabilityStats);

// Failed executions
router.get('/failures', getFailedExecutions);

// Retry & Resume
router.post('/retry/:executionId', retryExecution);
router.post('/resume/:executionId', resumeExecution);
router.get('/recovery/:executionId', getRecoverySummary);

// Dead Letter Queue
router.get('/dead-letter', getDeadLetterQueue);
router.post('/dead-letter/:id/replay', replayDeadLetterItem);
router.delete('/dead-letter/:id', deleteDeadLetterItem);

export default router;
