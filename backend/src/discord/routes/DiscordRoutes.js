import { Router } from 'express';
import { DiscordController } from '../controllers/DiscordController.js';
import { DiscordChannelController } from '../controllers/DiscordChannelController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

router.use((req, res, next) => {
  const start = Date.now();
  const credentialId = req.query.credentialId || req.query.credential || req.body?.credentialId || req.body?.credential || 'N/A';
  console.log(`[DiscordApiRequest] 📥 ${req.method} ${req.originalUrl} | CredentialID: ${credentialId}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[DiscordApiResponse] 📤 ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms`);
  });
  next();
});

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
