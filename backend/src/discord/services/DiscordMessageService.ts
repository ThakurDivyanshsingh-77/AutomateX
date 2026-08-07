import {
  IDiscordSendMessageInput,
  IDiscordSendMessageResult,
  IDiscordEmbed,
} from '../types/DiscordTypes.js';
import { DiscordCredentialService } from './DiscordCredentialService.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';

export class DiscordMessageService {
  /**
   * Send a message (text, markdown, mentions, embeds, TTS) to a Discord channel.
   */
  public static async sendMessage(
    ownerId: string,
    credentialId: string,
    input: Partial<IDiscordSendMessageInput>
  ): Promise<IDiscordSendMessageResult> {
    console.log(`[DiscordMessage] 🔑 Discord Credential Loaded: ${credentialId}`);

    const targetCredentialId = input.credentialId || credentialId;
    const targetGuildId = input.guildId || '';
    const targetChannelId = input.channelId || '';
    const content = (input.content || input.message || '').trim();

    console.log(`[DiscordMessage] 🏰 Guild Selected: ${targetGuildId || 'Not specified'}`);
    console.log(`[DiscordMessage] 📢 Channel Selected: ${targetChannelId || 'Not specified'}`);

    // Input Validations
    if (!targetCredentialId) {
      const err = new Error('Validation Error: Discord Credential is required.');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }
    if (!targetGuildId) {
      const err = new Error('Validation Error: Discord Guild (Server) selection is required.');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }
    if (!targetChannelId) {
      const err = new Error('Validation Error: Discord Channel selection is required.');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    // Embed parsing if provided as string
    let parsedEmbeds: IDiscordEmbed[] | undefined;
    if (input.embeds) {
      if (typeof input.embeds === 'string') {
        try {
          const parsed = JSON.parse(input.embeds);
          parsedEmbeds = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          const err = new Error('Validation Error: Provided "embeds" JSON string is invalid.');
          (err as unknown as { statusCode: number }).statusCode = 400;
          throw err;
        }
      } else if (Array.isArray(input.embeds)) {
        parsedEmbeds = input.embeds;
      }
    }

    // Empty message validation
    if (!content && (!parsedEmbeds || parsedEmbeds.length === 0)) {
      const err = new Error('Validation Error: Message content or Embed payload is required (cannot send empty message).');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    // Length validation
    if (content.length > 2000) {
      const err = new Error(`Validation Error: Discord message content exceeds 2000 characters limit (Current length: ${content.length}).`);
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    // 1. Fetch decrypted bot token securely
    const botToken = await DiscordCredentialService.getDecryptedBotToken(ownerId, targetCredentialId);

    // 2. Construct Discord API payload
    const body: Record<string, unknown> = {};

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
      body.flags = 4; // SUPPRESS_EMBEDS flag
    }

    console.log('[DiscordMessage] 🚀 Sending Message...');

    // 3. Send HTTP request via DiscordApiClient
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
