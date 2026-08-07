import { Router } from 'express';
import { DiscordController } from '../controllers/DiscordController.js';
import { DiscordChannelController } from '../controllers/DiscordChannelController.js';
// @ts-ignore - Existing JS module
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

// Protect all Discord endpoints with auth middleware
router.use(protect);

// Credential Verification & Creation Endpoints (Step 1)
router.post('/credentials/verify', DiscordController.verifyCredential);
router.post('/credentials', DiscordController.createCredential);

// Guild Service Endpoints (Step 2)
router.get('/guilds', DiscordController.getGuilds);
router.post('/guilds/refresh', DiscordController.refreshGuilds);
router.post('/guilds/validate', DiscordController.validateGuild);

// Channel Service Endpoints (Step 3)
router.get('/channels', DiscordChannelController.getChannels);
router.post('/channels/refresh', DiscordChannelController.refreshChannels);
router.post('/channels/validate', DiscordChannelController.validateChannel);

// Send Message Endpoints (Step 4)
router.post('/send-message', DiscordController.sendMessage);
router.post('/messages/send', DiscordController.sendMessage);

export default router;
