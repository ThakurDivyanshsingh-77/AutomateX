import { WebhookService } from './WebhookService.js';
import { WebhookReplay } from './WebhookReplay.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Handle incoming webhook request (GET, POST, PUT, PATCH, DELETE)
// @route   ALL /api/v1/webhooks/:identifier
// @access  Public (Guarded by WebhookAuth)
export const handleWebhook = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  try {
    const result = await WebhookService.processRequest(req, identifier);
    return res.status(202).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Webhook processing failed',
    });
  }
});

// @desc    Get Webhook Endpoint Metadata Info
// @route   GET /api/v1/webhooks/:identifier/info
// @access  Public
export const getWebhookInfo = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const baseUrl = `${req.protocol}://${req.get('host')}/api/v1/webhooks/${identifier}`;

  return res.status(200).json({
    success: true,
    identifier,
    webhookUrl: baseUrl,
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    samplePayload: {
      name: 'Divyansh',
      email: 'divyansh@gmail.com',
    },
  });
});

// @desc    Test Webhook payload inside Builder
// @route   POST /api/v1/webhooks/:identifier/test
// @access  Public
export const testWebhook = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  req.method = 'POST';

  try {
    const result = await WebhookService.processRequest(req, identifier);
    return res.status(200).json({
      ...result,
      isTestRun: true,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      isTestRun: true,
      message: err.message || 'Webhook test execution failed',
    });
  }
});

// @desc    Replay previous webhook execution
// @route   POST /api/v1/webhooks/replay/:executionId
// @access  Public / Protected
export const replayWebhookExecution = asyncHandler(async (req, res) => {
  const { executionId } = req.params;

  try {
    const result = await WebhookReplay.replay(executionId);
    return res.status(202).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Execution replay failed',
    });
  }
});
