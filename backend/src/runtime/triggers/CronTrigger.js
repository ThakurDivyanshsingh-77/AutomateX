import { BaseTrigger } from './BaseTrigger.js';

export class CronTrigger extends BaseTrigger {
  formatEvent(payload = {}) {
    return {
      triggerType: 'cron',
      timestamp: new Date().toISOString(),
      cronSchedule: payload.cronSchedule || '* * * * *',
      data: payload.data || {},
    };
  }
}
