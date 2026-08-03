import { BasePlugin } from '../shared/BasePlugin.js';
import { ConnectorClient } from '../connectors/ConnectorClient.js';

export class SlackPlugin extends BasePlugin {
  constructor() {
    super({
      name: 'slack',
      displayName: 'Slack Integrations',
      version: '1.0',
      icon: 'MessageSquare',
      category: 'Communication',
      actions: [
        { name: 'sendMessage', displayName: 'Send Channel Message' },
      ],
    });
  }

  async executeAction(actionName, payload, secret) {
    if (actionName === 'sendMessage') {
      const webhookUrl = payload.webhookUrl || secret;
      return await ConnectorClient.request({
        url: webhookUrl,
        method: 'POST',
        body: { text: payload.message || payload.text || 'Notification from AutomateX' },
        secret: webhookUrl,
      });
    }
    throw new Error(`Action "${actionName}" not supported by Slack plugin`);
  }
}
