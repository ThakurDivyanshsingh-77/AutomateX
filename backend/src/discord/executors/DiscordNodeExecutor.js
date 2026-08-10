import { DiscordMessageService } from '../services/DiscordMessageService.js';
import { DiscordEmbedService } from '../services/DiscordEmbedService.js';
import { DiscordCreateChannelService } from '../services/DiscordCreateChannelService.js';
import { DiscordDeleteChannelService } from '../services/DiscordDeleteChannelService.js';
import { DiscordCreateRoleService } from '../services/DiscordCreateRoleService.js';
import { DiscordDeleteRoleService } from '../services/DiscordDeleteRoleService.js';
import { DiscordAddRoleToMemberService } from '../services/DiscordAddRoleToMemberService.js';
import { DiscordRemoveRoleFromMemberService } from '../services/DiscordRemoveRoleFromMemberService.js';

export class DiscordNodeExecutor {
  async execute(nodeData, context) {
    const config = nodeData.config || nodeData.data || nodeData;
    const nodeType = String(nodeData.type || nodeData.nodeType || config.type || '').toLowerCase();

    const workflowObj = context.workflow || {};
    const executionObj = context.execution || {};
    const userObj = context.user || {};

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

    if (nodeType.includes('createchannel') || nodeType === 'discordcreatechannel') {
      return await DiscordCreateChannelService.createChannel(ownerId, credentialId, config);
    }

    if (nodeType.includes('deletechannel') || nodeType === 'discorddeletechannel') {
      return await DiscordDeleteChannelService.deleteChannel(ownerId, credentialId, config);
    }

    if (nodeType.includes('createrole') || nodeType === 'discordcreaterole') {
      return await DiscordCreateRoleService.createRole(ownerId, credentialId, config);
    }

    if (nodeType.includes('deleterole') || nodeType === 'discorddeleterole') {
      return await DiscordDeleteRoleService.deleteRole(ownerId, credentialId, { ...config, context });
    }

    if (nodeType.includes('addroletomember') || nodeType === 'discordaddroletomember') {
      return await DiscordAddRoleToMemberService.addRoleToMember(ownerId, credentialId, { ...config, context });
    }

    if (nodeType.includes('removerolefrommember') || nodeType === 'discordremoverolefrommember') {
      return await DiscordRemoveRoleFromMemberService.removeRoleFromMember(ownerId, credentialId, { ...config, context });
    }


    const channelId = String(config.channelId || config.channel || '');



    if (nodeType.includes('embed') || nodeType === 'discordsendembed') {
      const title = config.title ? String(config.title) : undefined;
      const description = config.description ? String(config.description) : undefined;
      const color = config.color;
      const url = config.url ? String(config.url) : undefined;
      const authorName = config.authorName ? String(config.authorName) : undefined;
      const authorUrl = config.authorUrl ? String(config.authorUrl) : undefined;
      const authorIconUrl = config.authorIconUrl ? String(config.authorIconUrl) : undefined;
      const thumbnailUrl = config.thumbnailUrl ? String(config.thumbnailUrl) : undefined;
      const imageUrl = config.imageUrl ? String(config.imageUrl) : undefined;
      const footerText = config.footerText ? String(config.footerText) : undefined;
      const footerIconUrl = config.footerIconUrl ? String(config.footerIconUrl) : undefined;
      const timestamp = Boolean(config.timestamp);
      const fields = Array.isArray(config.fields) ? config.fields : [];

      return await DiscordEmbedService.sendEmbed(ownerId, credentialId, {
        credentialId,
        guildId,
        channelId,
        title,
        description,
        color,
        url,
        authorName,
        authorUrl,
        authorIconUrl,
        thumbnailUrl,
        imageUrl,
        footerText,
        footerIconUrl,
        timestamp,
        fields,
      });
    }

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
