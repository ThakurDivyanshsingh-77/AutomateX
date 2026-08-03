import { BaseTrigger } from './BaseTrigger.js';

export class ManualTrigger extends BaseTrigger {
  formatEvent(payload = {}) {
    return {
      triggerType: 'manual',
      timestamp: new Date().toISOString(),
      data: payload.data || {},
      user: payload.userId || null,
    };
  }
}
