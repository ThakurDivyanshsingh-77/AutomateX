import { Router } from 'express';
import { DiscordController } from '../controllers/DiscordController.js';
import { DiscordChannelController } from '../controllers/DiscordChannelController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/credentials/verify', DiscordController.verifyCredential);
router.post('/credentials', DiscordController.createCredential);

router.get('/guilds', DiscordController.getGuilds);
router.post('/guilds/refresh', DiscordController.refreshGuilds);
router.post('/guilds/validate', DiscordController.validateGuild);

router.get('/channels', DiscordChannelController.getChannels);
router.post('/channels/refresh', DiscordChannelController.refreshChannels);
router.post('/channels/validate', DiscordChannelController.validateChannel);

router.post('/send-message', DiscordController.sendMessage);
router.post('/messages/send', DiscordController.sendMessage);

export default router;
