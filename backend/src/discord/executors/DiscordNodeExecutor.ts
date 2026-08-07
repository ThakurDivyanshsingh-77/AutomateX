import { DiscordMessageService } from '../services/DiscordMessageService.js';
import { IDiscordSendMessageResult } from '../types/DiscordTypes.js';

export class DiscordNodeExecutor {
  public async execute(nodeData: Record<string, unknown>, context: Record<string, unknown>): Promise<IDiscordSendMessageResult> {
    const config = (nodeData.config || nodeData.data || nodeData) as Record<string, unknown>;

    // Resolve ownerId strictly from context (workflow.ownerId / execution.userId / context.ownerId)
    const workflowObj = (context.workflow || {}) as Record<string, unknown>;
    const executionObj = (context.execution || {}) as Record<string, unknown>;
    const userObj = (context.user || {}) as Record<string, unknown>;

    const ownerId = String(
      context.ownerId ||
      context.userId ||
      workflowObj.ownerId ||
      executionObj.ownerId ||
      executionObj.userId ||
      userObj._id ||
      userObj.id ||
      ''
    ).trim();

    if (!ownerId || ownerId === 'system' || ownerId === 'undefined') {
      console.error('[DiscordNodeExecutor] ❌ Security Violation: Missing authenticated ownerId during workflow node execution.', {
        contextKeys: Object.keys(context),
        ownerId,
      });
      throw new Error(`[DiscordNodeExecutor] Security Error: Missing authenticated ownerId during workflow execution. Cannot perform node execution under "${ownerId}".`);
    }

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
