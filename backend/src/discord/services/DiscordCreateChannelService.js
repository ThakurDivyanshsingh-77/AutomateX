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

    // Step 4: Verify Guild & Bot Permissions (MANAGE_CHANNELS / ADMINISTRATOR)
    const MANAGE_CHANNELS = 16n;
    const ADMINISTRATOR = 8n;

    let botPermissions = null;

    // A. Resolve bot member permissions in the selected Guild
    try {
      const member = await client.getBotMember(guildId);
      if (member && member.permissions !== undefined && member.permissions !== null) {
        botPermissions = BigInt(member.permissions);
      } else if (member && Array.isArray(member.roles)) {
        // Fallback: compute bitfield from guild roles assigned to bot
        try {
          const roles = await client.getGuildRoles(guildId);
          if (Array.isArray(roles)) {
            let perms = 0n;
            const everyoneRole = roles.find((r) => r.id === guildId);
            if (everyoneRole && everyoneRole.permissions) {
              perms |= BigInt(everyoneRole.permissions);
            }
            for (const roleId of member.roles) {
              const role = roles.find((r) => r.id === roleId);
              if (role && role.permissions) {
                perms |= BigInt(role.permissions);
              }
            }
            botPermissions = perms;
          }
        } catch (roleErr) {
          console.warn(`[DiscordCreateChannel] ⚠️ Could not fetch guild roles for calculation: ${roleErr.message}`);
        }
      }
    } catch (memberErr) {
      console.warn(`[DiscordCreateChannel] ⚠️ Failed to fetch bot member info: ${memberErr.message}`);
      const norm = DiscordUtils.normalizeDiscordError(memberErr);
      if (norm.statusCode === 404 || memberErr.statusCode === 404) {
        const err = new Error('Discord server was not found.');
        err.statusCode = 404;
        throw err;
      }
      if (norm.statusCode === 401 || memberErr.statusCode === 401) {
        const err = new Error('Discord Bot Token is invalid or expired.');
        err.statusCode = 401;
        throw err;
      }
    }

    // B. Fallback: resolve matching guild from user's guilds if permissions still unknown
    if (botPermissions === null) {
      try {
        const userGuilds = await client.getCurrentUserGuilds();
        const matchingGuild = Array.isArray(userGuilds) ? userGuilds.find((g) => g.id === guildId) : null;
        if (Array.isArray(userGuilds) && userGuilds.length > 0 && !matchingGuild) {
          const err = new Error('Discord server was not found.');
          err.statusCode = 404;
          throw err;
        }
        if (matchingGuild && matchingGuild.permissions !== undefined && matchingGuild.permissions !== null) {
          botPermissions = BigInt(matchingGuild.permissions);
        }
      } catch (guildsErr) {
        console.warn(`[DiscordCreateChannel] ⚠️ Failed to fetch user guilds: ${guildsErr.message}`);
      }
    }

    // C. Evaluate effective permission bitfield
    if (botPermissions !== null) {
      const hasManageChannels = (botPermissions & MANAGE_CHANNELS) === MANAGE_CHANNELS;
      const hasAdmin = (botPermissions & ADMINISTRATOR) === ADMINISTRATOR;
      const hasPermission = hasManageChannels || hasAdmin;

      console.log(`[DiscordCreateChannel] 🛡️ Permission check bitfield=${botPermissions.toString()}, MANAGE_CHANNELS=${hasManageChannels}, ADMINISTRATOR=${hasAdmin}`);

      if (!hasPermission) {
        console.warn(`[DiscordCreateChannel] 🚫 Permission missing for Bot in Guild ${guildId}. Perms bitfield: ${botPermissions.toString()}`);
        const err = new Error('Bot requires Manage Channels permission in this server.');
        err.statusCode = 403;
        throw err;
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
        const createErr = new Error('Bot does not have permission to create channels in this server.');
        createErr.statusCode = 403;
        throw createErr;
      } else if (normalized.statusCode === 400) {
        const createErr = new Error('Discord rejected the channel configuration.');
        createErr.statusCode = 400;
        throw createErr;
      } else if (normalized.statusCode === 404) {
        const createErr = new Error('Discord server was not found.');
        createErr.statusCode = 404;
        throw createErr;
      } else if (normalized.statusCode === 401) {
        const createErr = new Error('Discord Bot Token is invalid or expired.');
        createErr.statusCode = 401;
        throw createErr;
      } else if (normalized.statusCode === 429) {
        const createErr = new Error('Discord rate limit reached. Please try again.');
        createErr.statusCode = 429;
        throw createErr;
      } else if (normalized.statusCode >= 500) {
        const createErr = new Error('Discord API Error');
        createErr.statusCode = normalized.statusCode;
        throw createErr;
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
