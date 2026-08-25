import express from 'express';
import { GitHubSyncReadmeService } from '../engine/github/GitHubSyncReadmeService.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to extract token from body or header
const resolveAuthToken = async (req) => {
  const userId = req.user?._id || req.user?.id || req.body.userId || null;
  const credentialId = req.body.credentialId;
  const directToken = req.body.token || req.body.secret || req.headers['x-github-token'];

  if (directToken) {
    return directToken.trim();
  }
  if (credentialId) {
    return await GitHubSyncReadmeService.resolveToken(credentialId, userId);
  }
  return null;
};

/**
 * POST /api/v1/github/verify
 * Test GitHub token or credential
 */
router.post('/verify', optionalAuth, async (req, res, next) => {
  try {
    const token = await resolveAuthToken(req);
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'No GitHub token or credentialId provided for verification.',
      });
    }

    const result = await GitHubSyncReadmeService.verifyGitHubToken(token);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * POST /api/v1/github/repos
 * List user repositories
 */
router.post('/repos', optionalAuth, async (req, res, next) => {
  try {
    const token = await resolveAuthToken(req);
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'GitHub authentication required to fetch repositories.',
      });
    }

    const {
      includePrivate = false,
      includeArchived = false,
      includeForks = false,
      sortBy = 'updated',
      maxProjects = 50,
      profileRepo = null,
    } = req.body;

    const repos = await GitHubSyncReadmeService.listUserRepositories(token, {
      includePrivate,
      includeArchived,
      includeForks,
      sortBy,
      maxProjects,
      profileRepo,
    });

    return res.status(200).json({
      success: true,
      data: repos,
      count: repos.length,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * POST /api/v1/github/profile-readme/preview
 * Dry-run test of README sync (CURRENT README -> GENERATED SECTION -> FINAL PREVIEW & DIFF)
 */
router.post('/profile-readme/preview', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id || req.body.userId || null;
    const config = req.body.config || req.body;

    const preview = await GitHubSyncReadmeService.previewSync(config, userId);
    return res.status(200).json(preview);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * POST /api/v1/github/profile-readme/apply
 * Explicitly apply and write the README to GitHub
 */
router.post('/profile-readme/apply', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id || req.body.userId || null;
    const config = req.body.config || req.body;

    const result = await GitHubSyncReadmeService.executeSync(config, userId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;
