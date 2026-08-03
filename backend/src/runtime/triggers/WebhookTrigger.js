import { BaseTrigger } from './BaseTrigger.js';

export class WebhookTrigger extends BaseTrigger {
  formatEvent(payload = {}) {
    return {
      triggerType: 'webhook',
      timestamp: new Date().toISOString(),
      data: {
        body: payload.body || {},
        headers: payload.headers || {},
        query: payload.query || {},
      },
    };
  }
}
