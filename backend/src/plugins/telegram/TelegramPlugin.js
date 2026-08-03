import { BasePlugin } from '../shared/BasePlugin.js';
import { ConnectorClient } from '../connectors/ConnectorClient.js';

export class TelegramPlugin extends BasePlugin {
  constructor() {
    super({
      name: 'telegram',
      displayName: 'Telegram Bot',
      version: '1.0',
      icon: 'Send',
      category: 'Communication',
      actions: [
        { name: 'sendMessage', displayName: 'Send Telegram Bot Message' },
      ],
    });
  }

  async executeAction(actionName, payload, secret) {
    if (actionName === 'sendMessage') {
      const botToken = payload.botToken || secret;
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      return await ConnectorClient.request({
        url,
        method: 'POST',
        body: { chat_id: payload.chatId, text: payload.text || payload.message },
      });
    }
    throw new Error(`Action "${actionName}" not supported by Telegram plugin`);
  }
}
