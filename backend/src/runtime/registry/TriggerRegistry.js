import { ManualTrigger } from '../triggers/ManualTrigger.js';
import { WebhookTrigger } from '../triggers/WebhookTrigger.js';
import { CronTrigger } from '../triggers/CronTrigger.js';

export class TriggerRegistry {
  static triggers = new Map([
    ['manual', new ManualTrigger()],
    ['webhook', new WebhookTrigger()],
    ['cron', new CronTrigger()],
  ]);

  static getTrigger(type) {
    const trigger = this.triggers.get(type);
    if (!trigger) {
      throw new Error(`Unsupported trigger type: "${type}"`);
    }
    return trigger;
  }

  static registerTrigger(type, triggerInstance) {
    this.triggers.set(type, triggerInstance);
  }
}
