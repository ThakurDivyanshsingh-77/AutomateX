import express from 'express';
import {
  handleWebhook,
  getWebhookInfo,
  testWebhook,
  replayWebhookExecution,
} from './WebhookController.js';

const router = express.Router();

// Replay execution endpoint
router.post('/replay/:executionId', replayWebhookExecution);

// Metadata and Test endpoints
router.get('/:identifier/info', getWebhookInfo);
router.post('/:identifier/test', testWebhook);

// Catch-all method endpoint for incoming Webhooks (GET, POST, PUT, PATCH, DELETE)
router.all('/:identifier', handleWebhook);

export default router;
