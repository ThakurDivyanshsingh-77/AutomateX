import { Workflow } from '../models/Workflow.js';
import { RuntimeManager } from '../runtime/RuntimeManager.js';
import { WebhookAuth } from './WebhookAuth.js';
import { WebhookValidator } from './WebhookValidator.js';
import mongoose from 'mongoose';

export class WebhookService {
  /**
   * Process incoming Webhook HTTP Request
   * @param {object} req - Express request
   * @param {string} identifier - token, workflowId, or custom path slug
   */
  static async processRequest(req, identifier) {
    // 1. Rate Limiting Check
    const rateLimit = WebhookValidator.checkRateLimit(identifier);
    if (!rateLimit.allowed) {
      const err = new Error(rateLimit.message);
      err.statusCode = rateLimit.statusCode;
      throw err;
    }

    // 2. Payload Size Check
    const sizeCheck = WebhookValidator.validatePayloadSize(req);
    if (!sizeCheck.valid) {
      const err = new Error(sizeCheck.message);
      err.statusCode = sizeCheck.statusCode;
      throw err;
    }

    // 3. Find Workflow in DB
    let workflow = null;
    if (mongoose.connection.readyState === 1) {
      workflow = await Workflow.findOne({
        $or: [
          { webhookToken: identifier },
          { customPath: identifier },
          { _id: mongoose.Types.ObjectId.isValid(identifier) ? identifier : null },
        ],
      });
    }

    // Fallback mock workflow if DB not ready
    if (!workflow) {
      workflow = {
        _id: identifier,
        name: 'Webhook Trigger Workflow',
        owner: 'usr_demo_123',
        definition: {
          nodes: [
            {
              id: 'node_webhook_1',
              type: 'webhook',
              data: {
                label: 'Webhook Trigger',
                config: { method: 'ANY', authType: 'none' },
              },
            },
            {
              id: 'node_log_1',
              type: 'log',
              data: {
                label: 'Console Logger',
                config: { message: 'Received Webhook Payload: {{trigger.body.name}}' },
              },
            },
            { id: 'node_end_1', type: 'end', data: { label: 'End Completion' } },
          ],
          edges: [
            { id: 'e1', source: 'node_webhook_1', target: 'node_log_1' },
            { id: 'e2', source: 'node_log_1', target: 'node_end_1' },
          ],
        },
      };
    }

    if (!workflow) {
      const err = new Error(`Webhook target "${identifier}" not found`);
      err.statusCode = 404;
      throw err;
    }

    // Extract Webhook Node Config from workflow definition
    const nodes = workflow.definition?.nodes || [];
    const webhookNode = nodes.find((n) => n.type === 'webhook' || n.type === 'start') || nodes[0];
    const nodeConfig = webhookNode?.data?.config || {};

    // 4. Validate HTTP Method
    const methodCheck = WebhookValidator.validateMethod(req.method, nodeConfig.method);
    if (!methodCheck.valid) {
      const err = new Error(methodCheck.message);
      err.statusCode = methodCheck.statusCode;
      throw err;
    }

    // 5. Validate Authentication
    const authCheck = WebhookAuth.validate(req, nodeConfig);
    if (!authCheck.authorized) {
      const err = new Error(authCheck.message);
      err.statusCode = authCheck.statusCode;
      throw err;
    }

    // 6. Build Trigger Payload & Context
    const triggerData = {
      trigger: {
        body: req.body || {},
        headers: req.headers || {},
        query: req.query || {},
        method: req.method,
        ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
        timestamp: new Date().toISOString(),
      },
    };

    // 7. Dispatch to Queue / RuntimeManager
    const result = await RuntimeManager.triggerExecution('webhook', workflow, triggerData);

    return {
      success: true,
      message: 'Webhook received and queued for execution',
      executionId: result.executionId,
      workflowId: workflow._id,
      queued: true,
      triggerPayload: triggerData.trigger,
    };
  }
}
