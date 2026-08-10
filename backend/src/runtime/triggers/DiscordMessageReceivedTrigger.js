import { BaseTrigger } from './BaseTrigger.js';

export class DiscordMessageReceivedTrigger extends BaseTrigger {
  formatEvent(payload = {}) {
    const message = payload.message || payload;
    const author = message.author || payload.author || {};

    const msgId = String(message.id || payload.id || '');
    const content = String(message.content || payload.content || '');
    const channelId = String(message.channelId || payload.channelId || '');
    const guildId = String(message.guildId || payload.guildId || '');

    return {
      triggerType: 'discordMessageReceived',
      timestamp: payload.triggeredAt || new Date().toISOString(),
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
      data: {
        content,
        channelId,
        guildId,
        messageId: msgId,
        authorName: String(author.username || ''),
      },
      raw: payload,
    };
  }
}
