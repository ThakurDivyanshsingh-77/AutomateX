import { Router } from 'express';
import { DiscordController } from '../controllers/DiscordController.js';
// @ts-ignore - Existing JS module
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

// Protect all Discord endpoints with auth middleware
router.use(protect);

// Credential Verification & Creation Endpoints (Step 1)
router.post('/credentials/verify', DiscordController.verifyCredential);
router.post('/credentials', DiscordController.createCredential);

// Dynamic Options Endpoints (Step 2: Guilds)
router.get('/guilds', DiscordController.getGuilds);

export default router;
