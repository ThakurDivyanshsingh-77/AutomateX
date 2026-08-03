import { BasePlugin } from '../shared/BasePlugin.js';
import { ConnectorClient } from '../connectors/ConnectorClient.js';

export class DiscordPlugin extends BasePlugin {
  constructor() {
    super({
      name: 'discord',
      displayName: 'Discord Webhooks',
      version: '1.0',
      icon: 'MessageCircle',
      category: 'Communication',
      actions: [
        { name: 'postMessage', displayName: 'Post Discord Message' },
      ],
    });
  }

  async executeAction(actionName, payload, secret) {
    if (actionName === 'postMessage') {
      const webhookUrl = payload.webhookUrl || secret;
      return await ConnectorClient.request({
        url: webhookUrl,
        method: 'POST',
        body: { content: payload.content || payload.message || 'AutomateX Notification' },
        secret: webhookUrl,
      });
    }
    throw new Error(`Action "${actionName}" not supported by Discord plugin`);
  }
}
