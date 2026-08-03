import express from 'express';
import {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
  duplicateWorkflow,
  publishWorkflow,
  archiveWorkflow,
} from '../controllers/workflowController.js';
import {
  runWorkflowExecution,
  getWorkflowExecutions,
} from '../controllers/executionController.js';
import { createWorkflowValidation, updateWorkflowValidation } from '../validations/workflowValidation.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all workflow endpoints with JWT guard
router.use(protect);

router.route('/')
  .post(createWorkflowValidation, createWorkflow)
  .get(getWorkflows);

router.route('/:id')
  .get(getWorkflowById)
  .put(updateWorkflowValidation, updateWorkflow)
  .delete(deleteWorkflow);

router.post('/:id/duplicate', duplicateWorkflow);
router.patch('/:id/publish', publishWorkflow);
router.patch('/:id/archive', archiveWorkflow);

// Workflow Execution Endpoints
router.post('/:id/run', runWorkflowExecution);
router.get('/:id/executions', getWorkflowExecutions);

export default router;
