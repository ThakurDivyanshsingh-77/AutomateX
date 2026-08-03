import { Workflow } from '../models/Workflow.js';
import { RuntimeManager } from '../runtime/RuntimeManager.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

// @desc    Receive public webhook payload and trigger workflow execution
// @route   POST /api/v1/webhooks/:token
// @access  Public (No JWT required)
export const handleIncomingWebhook = asyncHandler(async (req, res) => {
  const { token } = req.params;

  let workflow = null;

  if (mongoose.connection.readyState === 1) {
    // Search by webhookToken or by _id
    workflow = await Workflow.findOne({
      $or: [{ webhookToken: token }, { _id: mongoose.Types.ObjectId.isValid(token) ? token : null }],
    });
  } else {
    workflow = {
      _id: token,
      name: 'Webhook Demo Workflow',
      owner: 'usr_demo_123',
      definition: {
        nodes: [
          { id: 'n1', type: 'start', position: { x: 100, y: 100 }, data: { label: 'Start Trigger' } },
          { id: 'n2', type: 'log', position: { x: 400, y: 100 }, data: { label: 'Log Webhook Payload', config: { message: 'Received Webhook Event' } } },
          { id: 'n3', type: 'end', position: { x: 700, y: 100 }, data: { label: 'End Completion' } },
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2' },
          { id: 'e2', source: 'n2', target: 'n3' },
        ],
      },
    };
  }

  if (!workflow) {
    return res.status(404).json({
      success: false,
      message: 'Invalid webhook token or workflow not found',
    });
  }

  // Trigger Runtime Execution via RuntimeManager
  const result = await RuntimeManager.triggerExecution('webhook', workflow, {
    body: req.body,
    headers: req.headers,
    query: req.query,
  });

  // Return immediate 202 Accepted response
  return res.status(202).json({
    success: true,
    message: 'Webhook accepted for background execution',
    executionId: result.executionId,
    workflowId: workflow._id,
  });
});
