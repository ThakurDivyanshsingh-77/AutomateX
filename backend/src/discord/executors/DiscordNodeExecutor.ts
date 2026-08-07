import { DiscordMessageService } from '../services/DiscordMessageService.js';
import { IDiscordSendMessageResult } from '../types/DiscordTypes.js';

export class DiscordNodeExecutor {

  public async execute(nodeData: Record<string, unknown>, context: Record<string, unknown>): Promise<IDiscordSendMessageResult> {
    const config = (nodeData.config || nodeData.data || nodeData) as Record<string, unknown>;
    
    // Resolve expression variables from context or config
    const ownerId = (context.ownerId || context.userId || (context.user as Record<string, unknown>)?._id || 'system') as string;
    const credentialId = String(config.credentialId || config.credential || '');
    const guildId = String(config.guildId || config.guild || '');
    const channelId = String(config.channelId || config.channel || '');
    const content = String(config.content || config.message || '');
    const embeds = config.embeds as any;
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
