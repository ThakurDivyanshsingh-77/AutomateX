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
router.post('/send-embed', DiscordController.sendEmbed);
router.post('/embeds/send', DiscordController.sendEmbed);
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
router.get('/members', DiscordController.getMembers);
router.post('/members/refresh', DiscordController.refreshMembers);
router.post('/add-role-to-member', DiscordController.addRoleToMember);
router.post('/members/add-role', DiscordController.addRoleToMember);
router.post('/remove-role-from-member', DiscordController.removeRoleFromMember);
router.post('/members/remove-role', DiscordController.removeRoleFromMember);

export default router;
