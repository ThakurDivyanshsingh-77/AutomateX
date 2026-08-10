import { ManualTrigger } from '../triggers/ManualTrigger.js';
import { WebhookTrigger } from '../triggers/WebhookTrigger.js';
import { CronTrigger } from '../triggers/CronTrigger.js';
import { GoogleSheetsTrigger } from '../triggers/GoogleSheetsTrigger.js';
import { DiscordMessageReceivedTrigger } from '../triggers/DiscordMessageReceivedTrigger.js';

const googleSheetsTrigger = new GoogleSheetsTrigger();
const discordMessageReceivedTrigger = new DiscordMessageReceivedTrigger();

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
    ['google_sheets', googleSheetsTrigger],
    ['google_sheets_trigger', googleSheetsTrigger],
    ['GOOGLE_SHEETS', googleSheetsTrigger],
    ['discordmessagereceived', discordMessageReceivedTrigger],
    ['discordmessagereceivedtrigger', discordMessageReceivedTrigger],
    ['discordMessageReceived', discordMessageReceivedTrigger],
    ['discordMessageReceivedTrigger', discordMessageReceivedTrigger],
    ['discord_message_received', discordMessageReceivedTrigger],
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
