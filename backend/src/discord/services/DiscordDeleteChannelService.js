import { DiscordCredentialService } from './DiscordCredentialService.js';
import { DiscordChannelService } from './DiscordChannelService.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';
import { DiscordDeleteChannelValidator } from '../validations/DiscordDeleteChannelValidator.js';

export class DiscordDeleteChannelService {
  /**
   * Execute Discord → Delete Channel operation.
   *
   * @param {string} ownerId Authenticated owner/user ID
   * @param {string} credentialId Discord bot credential ID
   * @param {Object} rawConfig Channel deletion inputs
   */
  static async deleteChannel(ownerId, credentialId, rawConfig = {}) {
    const config = rawConfig.config || rawConfig.data || rawConfig;
    const targetCredId = credentialId || config.credentialId || config.credential;

    if (!ownerId || ownerId === 'system' || ownerId === 'undefined') {
      throw new Error('Security Error: Missing authenticated ownerId during channel deletion.');
    }

    if (!targetCredId) {
      throw new Error('Discord Credential is required.');
    }

    // Step 1: Validate Inputs & Confirmation Check
    const validation = DiscordDeleteChannelValidator.validate({
      ...config,
      credentialId: targetCredId,
    });

    if (!validation.isValid) {
      const firstError = validation.errors[0] || 'Invalid channel deletion configuration';
      console.warn(`[DiscordDeleteChannel] ❌ Validation Error: ${firstError}`);
      const err = new Error(firstError);
      err.statusCode = 400;
      throw err;
    }

    const channelId = validation.channelId;
    const guildId = String(config.guildId || config.guild || '').trim();

    // Step 2: Load Discord Credential
    console.log(`[DiscordDeleteChannel] 🔑 Discord Credential Loaded: ${targetCredId}`);
    const botToken = await DiscordCredentialService.getDecryptedBotToken(ownerId, targetCredId);

    if (!botToken) {
      const err = new Error('Discord bot token is invalid or expired. Reconnect/regenerate the Discord bot credential.');
      err.statusCode = 401;
      throw err;
    }
    console.log('[DiscordDeleteChannel] 🤖 Bot Token Validated');

    console.log(`[DiscordDeleteChannel] 🗑️ Deleting Channel ID: ${channelId}`);
    if (guildId) {
      console.log(`[DiscordDeleteChannel] 🏰 Guild ID: ${guildId}`);
    }

    const client = new DiscordApiClient({ botToken });

    // Step 3: Dispatch DELETE /channels/{channelId}
    console.log('[DiscordDeleteChannel] 🌐 Deleting Channel...');
    console.log(`[DiscordDeleteChannel] 📡 Discord API Request: DELETE /channels/${channelId}`);

    let rawDeleted;
    try {
      rawDeleted = await client.deleteChannel(channelId);
    } catch (err) {
      const normalized = DiscordUtils.normalizeDiscordError(err);
      const statusCode = err?.statusCode || normalized?.statusCode || 500;

      if (statusCode === 403) {
        const errorMsg = 'Discord bot does not have permission to delete/manage this channel. Grant Manage Channels permission to the bot and try again.';
        console.warn(`[DiscordDeleteChannel] 🚫 403 Forbidden: ${errorMsg}`);
        const delErr = new Error(errorMsg);
        delErr.statusCode = 403;
        throw delErr;
      } else if (statusCode === 404) {
        const errorMsg = 'Discord channel not found. It may already have been deleted or the bot may not have access to it.';
        console.warn(`[DiscordDeleteChannel] ❓ 404 Not Found: ${errorMsg}`);
        const delErr = new Error(errorMsg);
        delErr.statusCode = 404;
        throw delErr;
      } else if (statusCode === 401) {
        const errorMsg = 'Discord bot token is invalid or expired. Reconnect/regenerate the Discord bot credential.';
        console.warn(`[DiscordDeleteChannel] 🔑 401 Unauthorized: ${errorMsg}`);
        const delErr = new Error(errorMsg);
        delErr.statusCode = 401;
        throw delErr;
      } else if (statusCode === 429) {
        const errorMsg = 'Discord rate limit reached. Please try again.';
        console.warn(`[DiscordDeleteChannel] ⏳ 429 Rate Limited: ${errorMsg}`);
        const delErr = new Error(errorMsg);
        delErr.statusCode = 429;
        throw delErr;
      } else if (statusCode === 400) {
        const errorMsg = 'Discord rejected the channel configuration.';
        console.warn(`[DiscordDeleteChannel] ⚠️ 400 Bad Request: ${errorMsg}`);
        const delErr = new Error(errorMsg);
        delErr.statusCode = 400;
        throw delErr;
      }
      throw err;
    }

    console.log('[DiscordDeleteChannel] ✅ Channel Deleted Successfully');
    console.log(`[DiscordDeleteChannel] 🆔 Channel ID: ${rawDeleted.id || channelId}`);

    // Step 4: Clear Cache in DiscordChannelService for the target Guild
    const targetGuildId = rawDeleted.guild_id || guildId;
    if (targetGuildId) {
      try {
        DiscordChannelService.clearCache(ownerId, targetCredId, targetGuildId);
        console.log(`[DiscordDeleteChannel] 🔄 Invalidated DiscordChannelService cache for Guild ${targetGuildId}`);
      } catch (cacheErr) {
        console.warn(`[DiscordDeleteChannel] ⚠️ Cache invalidation warning: ${cacheErr.message}`);
      }
    }

    console.log('[DiscordDeleteChannel] 🏁 Execution Finished');

    return {
      success: true,
      channel: {
        id: rawDeleted.id || channelId,
        name: rawDeleted.name || 'deleted-channel',
        guildId: targetGuildId || '',
      },
      deleted: true,
    };
  }
}
