import { BaseExecutor } from './BaseExecutor.js';

export class ManualTriggerExecutor extends BaseExecutor {
  async execute(node, context) {
    const raw = context.initialPayload || context.currentData || {};
    const payload = raw.data || raw;
    const body = payload.body || (payload.email ? payload : {});
    const output = {
      triggeredAt: new Date().toISOString(),
      type: 'MANUAL',
      body,
      headers: payload.headers || {},
      query: payload.query || {},
      payload,
      message: 'Workflow triggered manually'
    };
    return {
      status: 'success',
      output,
    };
  }
}

export class WebhookTriggerExecutor extends BaseExecutor {
  async execute(node, context) {
    const raw = context.initialPayload || context.currentData || {};
    const payload = raw.data || raw;
    const body = payload.body || (payload.email ? payload : {});
    const output = {
      triggeredAt: new Date().toISOString(),
      type: 'WEBHOOK',
      headers: payload.headers || {},
      query: payload.query || {},
      body,
      method: payload.method || 'POST'
    };
    return {
      status: 'success',
      output,
    };
  }
}

export class ScheduleTriggerExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.data?.config || node.config || {};
    const output = {
      triggeredAt: new Date().toISOString(),
      type: 'SCHEDULE',
      cron: config.cron || '0 * * * *',
      message: 'Workflow triggered on schedule'
    };
    return {
      status: 'success',
      output,
    };
  }
}

export class DiscordMessageReceivedTriggerExecutor extends BaseExecutor {
  async execute(node, context) {
    const raw = context.initialPayload || context.currentData || {};
    const message = raw.message || raw;
    const author = message.author || raw.author || {};

    const msgId = String(message.id || raw.id || '');
    const content = String(message.content || raw.content || '');
    const channelId = String(message.channelId || raw.channelId || '');
    const guildId = String(message.guildId || raw.guildId || '');

    const output = {
      message: {
        id: msgId,
        content,
        channelId,
        guildId,
        author: {
          id: String(author.id || ''),
          username: String(author.username || ''),
          bot: Boolean(author.bot),
        },
      },
      content,
      channelId,
      guildId,
      author: {
        id: String(author.id || ''),
        username: String(author.username || ''),
        bot: Boolean(author.bot),
      },
      id: msgId,
      triggeredAt: raw.triggeredAt || new Date().toISOString(),
    };

    return {
      status: 'success',
      output,
    };
  }
}
