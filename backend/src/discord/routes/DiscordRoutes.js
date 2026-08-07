import { Router } from 'express';
import { DiscordController } from '../controllers/DiscordController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/credentials/verify', DiscordController.verifyCredential);
router.post('/credentials', DiscordController.createCredential);
router.get('/guilds', DiscordController.getGuilds);

export default router;
