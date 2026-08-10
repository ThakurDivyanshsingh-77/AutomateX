import { Router } from 'express';
import { DiscordController } from '../controllers/DiscordController.js';
import { DiscordChannelController } from '../controllers/DiscordChannelController.js';
// @ts-ignore - Existing JS module
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

// Detailed Request / Response Logger Middleware for Discord API
router.use((req, res, next) => {
  const start = Date.now();
  const credentialId = (req.query.credentialId || req.query.credential || req.body?.credentialId || req.body?.credential || 'N/A') as string;
  console.log(`[DiscordApiRequest] 📥 ${req.method} ${req.originalUrl} | CredentialID: ${credentialId}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[DiscordApiResponse] 📤 ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms`);
  });
  next();
});

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

// Send Message & Embed Endpoints (Step 4 & Embed Node)
router.post('/send-message', DiscordController.sendMessage);
router.post('/messages/send', DiscordController.sendMessage);
router.post('/send-embed', DiscordController.sendEmbed);
router.post('/embeds/send', DiscordController.sendEmbed);

// Role & Channel Operations
router.post('/create-channel', DiscordController.createChannel);
router.post('/channels/create', DiscordController.createChannel);
router.post('/delete-channel', DiscordController.deleteChannel);
router.post('/channels/delete', DiscordController.deleteChannel);
router.post('/create-role', DiscordController.createRole);
router.post('/roles/create', DiscordController.createRole);
router.get('/roles', DiscordController.getRoles);
router.post('/roles/refresh', DiscordController.refreshRoles);
router.post('/delete-role', DiscordController.deleteRole);
router.post('/roles/delete', DiscordController.deleteRole);

export default router;
