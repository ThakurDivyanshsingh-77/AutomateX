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
router.get('/google', (req, res, next) => {
  console.debug('[CredentialRoutes] Google OAuth credentials request', {
    authenticatedUserId: req.user?._id ? String(req.user._id) : null,
  });
  return getGmailCredentials(req, res, next);
});
router.post('/:id/test', testGmailConnection);

// ── General CRUD ──────────────────────────────────────────────────────────────
router.route('/')
  .post(createCredential)
  .get(getUserCredentials);

router.delete('/:id', deleteCredential);

export default router;
