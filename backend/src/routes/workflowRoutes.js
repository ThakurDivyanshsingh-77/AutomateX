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
import {
  listVersions,
  getVersion,
  saveDraft,
  publishVersion,
  restoreVersion,
  compareVersions,
  deleteDraft,
} from '../controllers/workflowVersionController.js';
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
router.patch('/:id/archive', archiveWorkflow);

// ─── Phase 10 Version Management Routes ──────────────────────────────────────

// Version CRUD
router.get('/:id/versions', listVersions);
router.get('/:id/versions/:version', getVersion);

// Draft save (autosave)
router.post('/:id/versions/draft', saveDraft);

// Publish new version (replaces old basic publish)
router.post('/:id/publish', publishVersion);

// Restore to a previous version
router.post('/:id/restore/:version', restoreVersion);

// Compare two versions
router.post('/:id/compare', compareVersions);

// Delete current draft
router.delete('/:id/draft', deleteDraft);

// ─── Legacy / Basic Publish (kept for backward compat — calls same handler) ──
router.patch('/:id/publish', publishWorkflow);

// ─── Execution Routes ─────────────────────────────────────────────────────────
router.post('/:id/run', runWorkflowExecution);
router.get('/:id/executions', getWorkflowExecutions);

export default router;
