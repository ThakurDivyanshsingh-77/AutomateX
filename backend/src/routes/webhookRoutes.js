import express from 'express';
import { handleIncomingWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Public Webhook Receiver Endpoint (No Auth Guard required)
router.post('/:token', handleIncomingWebhook);

export default router;
