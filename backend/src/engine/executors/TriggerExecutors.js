import { BaseExecutor } from './BaseExecutor.js';

export class ManualTriggerExecutor extends BaseExecutor {
  async execute(node, context) {
    const payload = context.initialPayload || {};
    return {
      triggeredAt: new Date().toISOString(),
      type: 'MANUAL',
      payload,
      message: 'Workflow triggered manually'
    };
  }
}

export class WebhookTriggerExecutor extends BaseExecutor {
  async execute(node, context) {
    const payload = context.initialPayload || {};
    return {
      triggeredAt: new Date().toISOString(),
      type: 'WEBHOOK',
      headers: payload.headers || {},
      query: payload.query || {},
      body: payload.body || {},
      method: payload.method || 'POST'
    };
  }
}

export class ScheduleTriggerExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.data?.config || {};
    return {
      triggeredAt: new Date().toISOString(),
      type: 'SCHEDULE',
      cron: config.cron || '0 * * * *',
      message: 'Workflow triggered on schedule'
    };
  }
}
