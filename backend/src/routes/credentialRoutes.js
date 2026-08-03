import express from 'express';
import {
  createCredential,
  getUserCredentials,
  deleteCredential,
  getGmailCredentials,
  testGmailConnection,
} from '../controllers/credentialController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// ── Gmail-specific routes MUST come BEFORE /:id wildcard ─────────────────────
router.get('/google', getGmailCredentials);
router.post('/:id/test', testGmailConnection);

// ── General CRUD ──────────────────────────────────────────────────────────────
router.route('/')
  .post(createCredential)
  .get(getUserCredentials);

router.delete('/:id', deleteCredential);

export default router;
