import { ManualTrigger } from '../triggers/ManualTrigger.js';
import { WebhookTrigger } from '../triggers/WebhookTrigger.js';
import { CronTrigger } from '../triggers/CronTrigger.js';
import { GoogleSheetsTrigger } from '../triggers/GoogleSheetsTrigger.js';

const googleSheetsTrigger = new GoogleSheetsTrigger();

export class TriggerRegistry {
  static triggers = new Map([
    ['start', new ManualTrigger()],
    ['manual', new ManualTrigger()],
    ['webhook', new WebhookTrigger()],
    ['cron', new CronTrigger()],
    ['googlesheetstrigger', googleSheetsTrigger],
    ['googlesheetstriggerwatchrows', googleSheetsTrigger],
    ['googleSheetsTrigger', googleSheetsTrigger],
    ['googleSheetsTriggerWatchRows', googleSheetsTrigger],
  ]);

  static isTrigger(type) {
    if (!type) return false;
    const normalized = String(type).toLowerCase();
    return normalized === 'start' || normalized === 'manual' || this.triggers.has(normalized) || this.triggers.has(type);
  }

  static getTrigger(type) {
    const normalized = String(type).toLowerCase();
    const trigger = this.triggers.get(normalized) || this.triggers.get(type);
    if (!trigger) {
      throw new Error(`Unsupported trigger type: "${type}"`);
    }
    return trigger;
  }

  static registerTrigger(type, triggerInstance) {
    this.triggers.set(type, triggerInstance);
  }
}
