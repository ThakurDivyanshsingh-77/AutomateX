import { Router } from 'express';
import { DiscordChannelController } from '../controllers/DiscordChannelController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', DiscordChannelController.getChannels);
router.post('/refresh', DiscordChannelController.refreshChannels);
router.post('/validate', DiscordChannelController.validateChannel);

export default router;
