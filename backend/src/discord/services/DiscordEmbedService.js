import { DiscordEmbedValidators } from '../validations/DiscordEmbedValidators.js';
import { DiscordCredentialService } from './DiscordCredentialService.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';

export class DiscordEmbedService {
  static async sendEmbed(ownerId, credentialId, input) {
    console.log('[DiscordEmbed] 🎨 Preparing to send Discord Embed Message...');

    const targetCredId = credentialId || input.credentialId;
    const validation = DiscordEmbedValidators.validateEmbedInput({
      ...input,
      credentialId: targetCredId,
    });

    if (!validation.isValid || !validation.formattedEmbed) {
      console.warn(`[DiscordEmbed] ❌ Validation Error: ${validation.errors.join(' | ')}`);
      const err = new Error(`Validation Error: ${validation.errors.join(' ')}`);
      err.statusCode = 400;
      throw err;
    }

    console.log(`[DiscordEmbed] 🔑 Loading credential for owner "${ownerId}" and ID "${targetCredId}"...`);
    const botToken = await DiscordCredentialService.getDecryptedBotToken(ownerId, targetCredId);

    const client = new DiscordApiClient({ botToken });

    console.log(`[DiscordEmbed] 📢 Dispatching Embed to Channel: ${input.channelId}`);
    const rawMessage = await client.createChannelMessage(input.channelId, {
      embeds: [validation.formattedEmbed],
    });

    const messageId = String(rawMessage.id);
    const channelId = String(rawMessage.channel_id || input.channelId);
    const guildId = String(input.guildId || rawMessage.guild_id || '');
    const timestamp = rawMessage.timestamp || new Date().toISOString();
    const messageUrl = `https://discord.com/channels/${guildId || '@me'}/${channelId}/${messageId}`;

    console.log(`[DiscordEmbed] ✅ Embed Message Sent Successfully! Message ID: ${messageId}`);

    return {
      success: true,
      messageId,
      channelId,
      guildId,
      timestamp,
      messageUrl,
      rawMessage,
    };
  }
}
