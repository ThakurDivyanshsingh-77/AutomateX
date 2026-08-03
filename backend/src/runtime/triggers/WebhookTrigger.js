import { BaseTrigger } from './BaseTrigger.js';

export class WebhookTrigger extends BaseTrigger {
  formatEvent(payload = {}) {
    const root = payload.trigger || payload;
    return {
      triggerType: 'webhook',
      timestamp: new Date().toISOString(),
      data: {
        body: root.body || (root.email ? root : {}),
        headers: root.headers || {},
        query: root.query || {},
        method: root.method || 'POST',
      },
    };
  }
}
