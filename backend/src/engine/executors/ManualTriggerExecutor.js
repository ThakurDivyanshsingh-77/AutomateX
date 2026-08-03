import { BaseExecutor } from './BaseExecutor.js';

export class ManualTriggerExecutor extends BaseExecutor {
  async execute(node, context) {
    const raw = context.initialPayload || context.currentData || {};
    const payload = raw.data || raw;
    const body = payload.body || (payload.email ? payload : {});
    return {
      status: 'success',
      output: {
        triggeredAt: new Date().toISOString(),
        triggerType: 'manual',
        body,
        headers: payload.headers || {},
        query: payload.query || {},
        payload,
        message: 'Workflow execution initialized',
      },
    };
  }
}
