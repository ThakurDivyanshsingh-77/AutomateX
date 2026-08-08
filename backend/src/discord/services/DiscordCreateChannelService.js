import { DiscordCredentialService } from './DiscordCredentialService.js';
import { DiscordChannelService } from './DiscordChannelService.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';
import { DiscordCreateChannelValidator } from '../validations/DiscordCreateChannelValidator.js';

export class DiscordCreateChannelService {
  /**
   * Execute Discord → Create Channel operation.
   *
   * @param {string} ownerId Authenticated owner/user ID
   * @param {string} credentialId Discord bot credential ID
   * @param {Object} rawConfig Channel creation inputs
   */
  static async createChannel(ownerId, credentialId, rawConfig = {}) {
    const config = rawConfig.config || rawConfig.data || rawConfig;
    const targetCredId = credentialId || config.credentialId || config.credential;

    if (!ownerId || ownerId === 'system' || ownerId === 'undefined') {
      throw new Error('Security Error: Missing authenticated ownerId during channel creation.');
    }

    if (!targetCredId) {
      throw new Error('Discord Credential is required.');
    }

    // Step 1: Load Discord Credential
    console.log(`[DiscordCreateChannel] 🔑 Discord Credential Loaded: ${targetCredId}`);
    const botToken = await DiscordCredentialService.getDecryptedBotToken(ownerId, targetCredId);

    // Step 2: Validate Bot Token
    if (!botToken) {
      throw new Error('Failed to resolve decrypted Bot Token for Discord credential.');
    }
    console.log('[DiscordCreateChannel] 🤖 Bot Token Validated');

    // Step 3: Validate Inputs (Guild, Type, Name)
    const validation = DiscordCreateChannelValidator.validate({
      ...config,
      credentialId: targetCredId,
    });

    if (!validation.isValid) {
      const firstError = validation.errors[0] || 'Invalid channel configuration';
      console.warn(`[DiscordCreateChannel] ❌ Validation Error: ${firstError}`);
      const err = new Error(firstError);
      err.statusCode = 400;
      throw err;
    }

    const guildId = String(config.guildId || config.guild || '').trim();
    console.log(`[DiscordCreateChannel] 🏰 Guild Selected: ${guildId}`);

    const channelType = validation.parsedType;
    const typeLabel = channelType === 0 ? 'Text' : channelType === 2 ? 'Voice' : 'Category';
    console.log(`[DiscordCreateChannel] 🏷️ Channel Type: ${typeLabel}`);

    const channelName = validation.trimmedName;
    console.log(`[DiscordCreateChannel] 📝 Channel Name: ${channelName}`);

    const client = new DiscordApiClient({ botToken });

    // Step 4: Verify Guild & Bot Permissions (MANAGE_CHANNELS)
    let userGuilds = [];
    try {
      userGuilds = await client.getCurrentUserGuilds();
    } catch (err) {
      console.warn(`[DiscordCreateChannel] ⚠️ Failed to fetch bot guilds during permission check: ${err.message}`);
    }

    const matchingGuild = Array.isArray(userGuilds) ? userGuilds.find((g) => g.id === guildId) : null;
    if (userGuilds.length > 0 && !matchingGuild) {
      const err = new Error('Guild Not Found: Bot is not a member of the specified Discord server.');
      err.statusCode = 404;
      throw err;
    }

    if (matchingGuild && matchingGuild.permissions !== undefined) {
      try {
        const permsBigInt = BigInt(matchingGuild.permissions);
        const MANAGE_CHANNELS = 0x10n; // Bit 4
        const ADMINISTRATOR = 0x8n;     // Bit 3

        const hasManageChannels = (permsBigInt & MANAGE_CHANNELS) !== 0n || (permsBigInt & ADMINISTRATOR) !== 0n;
        if (!hasManageChannels) {
          console.warn(`[DiscordCreateChannel] 🚫 Permission missing for Bot in Guild ${guildId}. Permissions bitfield: ${matchingGuild.permissions}`);
          const err = new Error('Bot requires Manage Channels permission.');
          err.statusCode = 403;
          throw err;
        }
      } catch (err) {
        if (err.statusCode === 403) throw err;
        // Ignore BigInt parse issues and proceed to API request
      }
    }

    // Step 5: Build API Payload per Channel Type
    const payload = {
      name: channelName,
      type: channelType,
    };

    if (channelType === 0) {
      // Text Channel
      if (config.topic && String(config.topic).trim()) {
        payload.topic = String(config.topic).trim();
      }
      if (typeof config.nsfw === 'boolean' || config.nsfw === 'true' || config.nsfw === 'false') {
        payload.nsfw = Boolean(config.nsfw === true || config.nsfw === 'true');
      }
      if (config.slowmode !== undefined && config.slowmode !== null && config.slowmode !== '') {
        const slowmodeNum = Number(config.slowmode);
        if (!isNaN(slowmodeNum) && slowmodeNum >= 0) {
          payload.rate_limit_per_user = slowmodeNum;
        }
      }
      const parentId = config.parentId || config.category || config.parent_id;
      if (parentId && String(parentId).trim() && String(parentId) !== 'none') {
        payload.parent_id = String(parentId).trim();
      }
    } else if (channelType === 2) {
      // Voice Channel
      if (config.bitrate !== undefined && config.bitrate !== null && config.bitrate !== '') {
        const bitrateNum = Number(config.bitrate);
        if (!isNaN(bitrateNum) && bitrateNum >= 8000) {
          payload.bitrate = bitrateNum;
        }
      }
      if (config.userLimit !== undefined && config.userLimit !== null && config.userLimit !== '') {
        const limitNum = Number(config.userLimit);
        if (!isNaN(limitNum) && limitNum >= 0) {
          payload.user_limit = limitNum;
        }
      }
      const parentId = config.parentId || config.category || config.parent_id;
      if (parentId && String(parentId).trim() && String(parentId) !== 'none') {
        payload.parent_id = String(parentId).trim();
      }
    } else if (channelType === 4) {
      // Category (Name only)
    }

    // Step 6: Perform Discord API Request
    console.log('[DiscordCreateChannel] 🌐 Creating Channel...');
    console.log(`[DiscordCreateChannel] 📡 Discord API Request: POST /guilds/${guildId}/channels`);

    let rawCreated;
    try {
      rawCreated = await client.createChannel(guildId, payload);
    } catch (err) {
      const normalized = DiscordUtils.normalizeDiscordError(err);
      if (normalized.statusCode === 403) {
        throw new Error('Bot does not have permission to create channels in this server.');
      } else if (normalized.statusCode === 400) {
        throw new Error('Discord rejected the channel configuration.');
      } else if (normalized.statusCode === 404) {
        throw new Error('Guild Not Found: Specified Discord server does not exist.');
      } else if (normalized.statusCode === 429) {
        throw new Error('Discord rate limit reached. Please try again shortly.');
      } else if (normalized.statusCode >= 500) {
        throw new Error('Discord API Error: Service is currently unavailable.');
      }
      throw err;
    }

    console.log('[DiscordCreateChannel] ✅ Channel Created Successfully');
    console.log(`[DiscordCreateChannel] 🆔 Channel ID: ${rawCreated.id}`);

    // Invalidate cached channels for this guild so dropdowns refresh automatically
    try {
      DiscordChannelService.clearCache(ownerId, targetCredId, guildId);
      console.log(`[DiscordCreateChannel] 🔄 Invalidated DiscordChannelService cache for Guild ${guildId}`);
    } catch (err) {
      console.warn(`[DiscordCreateChannel] ⚠️ Failed to invalidate channel cache: ${err.message}`);
    }

    console.log('[DiscordCreateChannel] 🏁 Execution Finished');

    const channelUrl = `https://discord.com/channels/${guildId}/${rawCreated.id}`;

    return {
      success: true,
      channel: {
        id: rawCreated.id,
        name: rawCreated.name,
        type: rawCreated.type,
        guildId: guildId,
        parentId: rawCreated.parent_id || null,
      },
      channelUrl,
    };
  }
}
