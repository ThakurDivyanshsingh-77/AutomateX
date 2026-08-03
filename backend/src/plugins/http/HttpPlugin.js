import { BasePlugin } from '../shared/BasePlugin.js';
import { ConnectorClient } from '../connectors/ConnectorClient.js';

export class HttpPlugin extends BasePlugin {
  constructor() {
    super({
      name: 'http',
      displayName: 'HTTP REST Integrations',
      version: '1.0',
      icon: 'Globe',
      category: 'Utility',
      actions: [
        { name: 'request', displayName: 'Send REST API Request' },
      ],
    });
  }

  async executeAction(actionName, payload, secret) {
    return await ConnectorClient.request({
      url: payload.url,
      method: payload.method || 'GET',
      headers: payload.headers,
      body: payload.body,
      secret,
    });
  }
}
