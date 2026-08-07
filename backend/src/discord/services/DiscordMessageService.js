import { DiscordCredentialService } from './DiscordCredentialService.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';

export class DiscordMessageService {
  /**
   * Send a message to a Discord channel.
   */
  static async sendMessage(ownerId, credentialId, input) {
    console.log(`[DiscordMessage] 🔑 Discord Credential Loaded: ${credentialId}`);

    const targetCredentialId = input.credentialId || credentialId;
    const targetGuildId = input.guildId || '';
    const targetChannelId = input.channelId || '';
    const content = (input.content || input.message || '').trim();

    console.log(`[DiscordMessage] 🏰 Guild Selected: ${targetGuildId || 'Not specified'}`);
    console.log(`[DiscordMessage] 📢 Channel Selected: ${targetChannelId || 'Not specified'}`);

    if (!targetCredentialId) {
      const err = new Error('Validation Error: Discord Credential is required.');
      err.statusCode = 400;
      throw err;
    }
    if (!targetGuildId) {
      const err = new Error('Validation Error: Discord Guild (Server) selection is required.');
      err.statusCode = 400;
      throw err;
    }
    if (!targetChannelId) {
      const err = new Error('Validation Error: Discord Channel selection is required.');
      err.statusCode = 400;
      throw err;
    }

    let parsedEmbeds;
    if (input.embeds) {
      if (typeof input.embeds === 'string') {
        try {
          const parsed = JSON.parse(input.embeds);
          parsedEmbeds = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          const err = new Error('Validation Error: Provided "embeds" JSON string is invalid.');
          err.statusCode = 400;
          throw err;
        }
      } else if (Array.isArray(input.embeds)) {
        parsedEmbeds = input.embeds;
      }
    }

    if (!content && (!parsedEmbeds || parsedEmbeds.length === 0)) {
      const err = new Error('Validation Error: Message content or Embed payload is required (cannot send empty message).');
      err.statusCode = 400;
      throw err;
    }

    if (content.length > 2000) {
      const err = new Error(`Validation Error: Discord message content exceeds 2000 characters limit (Current length: ${content.length}).`);
      err.statusCode = 400;
      throw err;
    }

    const botToken = await DiscordCredentialService.getDecryptedBotToken(ownerId, targetCredentialId);

    const body = {};
    if (content) {
      body.content = content;
    }
    if (input.tts) {
      body.tts = true;
    }
    if (parsedEmbeds && parsedEmbeds.length > 0) {
      body.embeds = parsedEmbeds;
    }
    if (input.replyToMessageId) {
      body.message_reference = { message_id: input.replyToMessageId.trim() };
    }
    if (input.allowedMentions) {
      body.allowed_mentions = input.allowedMentions;
    }
    if (input.suppressEmbeds) {
      body.flags = 4;
    }

    console.log('[DiscordMessage] 🚀 Sending Message...');

    const client = new DiscordApiClient({ botToken });
    const rawResult = await client.createChannelMessage(targetChannelId, body);

    const messageId = String(rawResult.id || '');
    const channelId = String(rawResult.channel_id || targetChannelId);
    const guildId = String(rawResult.guild_id || targetGuildId);
    const timestamp = String(rawResult.timestamp || new Date().toISOString());
    const messageUrl = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;

    console.log('[DiscordMessage] ✅ Message Sent Successfully');
    console.log(`[DiscordMessage] 🆔 Message ID: ${messageId}`);
    console.log('[DiscordMessage] 🏁 Execution Finished');

    return {
      success: true,
      messageId,
      channelId,
      guildId,
      timestamp,
      messageUrl,
      rawMessage: rawResult,
    };
  }
}
