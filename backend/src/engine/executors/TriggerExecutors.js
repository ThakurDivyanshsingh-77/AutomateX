import { BaseExecutor } from './BaseExecutor.js';

export class ManualTriggerExecutor extends BaseExecutor {
  async execute(node, context) {
    const raw = context.initialPayload || context.currentData || {};
    const payload = raw.data || raw;
    const body = payload.body || (payload.email ? payload : {});
    const output = {
      triggeredAt: new Date().toISOString(),
      type: 'MANUAL',
      body,
      headers: payload.headers || {},
      query: payload.query || {},
      payload,
      message: 'Workflow triggered manually'
    };
    return {
      status: 'success',
      output,
    };
  }
}

export class WebhookTriggerExecutor extends BaseExecutor {
  async execute(node, context) {
    const raw = context.initialPayload || context.currentData || {};
    const payload = raw.data || raw;
    const body = payload.body || (payload.email ? payload : {});
    const output = {
      triggeredAt: new Date().toISOString(),
      type: 'WEBHOOK',
      headers: payload.headers || {},
      query: payload.query || {},
      body,
      method: payload.method || 'POST'
    };
    return {
      status: 'success',
      output,
    };
  }
}

export class ScheduleTriggerExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.data?.config || node.config || {};
    const output = {
      triggeredAt: new Date().toISOString(),
      type: 'SCHEDULE',
      cron: config.cron || '0 * * * *',
      message: 'Workflow triggered on schedule'
    };
    return {
      status: 'success',
      output,
    };
  }
}
