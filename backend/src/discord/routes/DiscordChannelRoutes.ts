import { Router } from 'express';
import { DiscordChannelController } from '../controllers/DiscordChannelController.js';
// @ts-ignore - Existing JS module
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

// Channel Service Endpoints (Step 3)
router.get('/', DiscordChannelController.getChannels);
router.post('/refresh', DiscordChannelController.refreshChannels);
router.post('/validate', DiscordChannelController.validateChannel);

export default router;
