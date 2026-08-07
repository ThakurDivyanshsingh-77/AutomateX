import { DiscordMessageService } from '../services/DiscordMessageService.js';

export class DiscordNodeExecutor {
  async execute(nodeData, context = {}) {
    const config = nodeData.config || nodeData.data || nodeData || {};
    
    const ownerId = context.ownerId || context.userId || context.user?._id || 'system';
    const credentialId = String(config.credentialId || config.credential || '');
    const guildId = String(config.guildId || config.guild || '');
    const channelId = String(config.channelId || config.channel || '');
    const content = String(config.content || config.message || '');
    const embeds = config.embeds;
    const tts = Boolean(config.tts);
    const replyToMessageId = config.replyToMessageId ? String(config.replyToMessageId) : undefined;
    const suppressEmbeds = Boolean(config.suppressEmbeds);

    return await DiscordMessageService.sendMessage(ownerId, credentialId, {
      credentialId,
      guildId,
      channelId,
      content,
      embeds,
      tts,
      replyToMessageId,
      suppressEmbeds,
    });
  }
}
