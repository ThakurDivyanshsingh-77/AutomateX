import { DiscordCredentialService } from './DiscordCredentialService.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';
import { DiscordChannelMapper } from '../mappers/DiscordChannelMapper.js';

export class DiscordChannelService {
  static cache = new Map();
  static CACHE_TTL_MS = 60 * 1000;

  /**
   * Fetch all supported Discord Channels for a server.
   */
  static async getChannels(ownerId, credentialId, guildId, bypassCache = false) {
    console.log(`[DiscordChannel] 🔑 Discord Credential Loaded: ${credentialId}`);
    console.log(`[DiscordChannel] 🏰 Guild Selected: ${guildId}`);

    if (!guildId) {
      throw new Error('guildId parameter is required to load channels');
    }

    const cacheKey = `${ownerId}:${credentialId}:${guildId}`;

    if (!bypassCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      const ageMs = Date.now() - cached.timestamp;
      if (ageMs < this.CACHE_TTL_MS) {
        console.log(`[DiscordChannel] ⚡ Returned ${cached.channels.length} Channels from cache`);
        return { success: true, channels: cached.channels };
      }
      this.cache.delete(cacheKey);
    }

    console.log('[DiscordChannel] 🔄 Loading Channels...');
    const botToken = await DiscordCredentialService.getDecryptedBotToken(ownerId, credentialId);

    const client = new DiscordApiClient({ botToken });
    const rawChannels = await client.getGuildChannels(guildId);

    const channels = DiscordChannelMapper.mapManyToDto(rawChannels);

    console.log(`[DiscordChannel] ✅ Found ${channels.length} Channels`);
    if (channels.length > 0) {
      const namesList = channels.slice(0, 5).map((c) => c.name).join(', ');
      console.log(`[DiscordChannel] 📋 Loaded: ${namesList}${channels.length > 5 ? '...' : ''}`);
    }

    this.cache.set(cacheKey, {
      timestamp: Date.now(),
      channels,
    });

    return { success: true, channels };
  }

  /**
   * Refresh channels by invalidating cache.
   */
  static async refreshChannels(ownerId, credentialId, guildId) {
    console.log(`[DiscordChannel] 🔄 Refreshing Channels for Guild ID: ${guildId}...`);
    this.cache.delete(`${ownerId}:${credentialId}:${guildId}`);
    return await this.getChannels(ownerId, credentialId, guildId, true);
  }

  /**
   * Validate whether a specific Channel ID exists in the Guild.
   */
  static async validateChannel(ownerId, credentialId, guildId, channelId) {
    try {
      const res = await this.getChannels(ownerId, credentialId, guildId, false);
      return res.channels.some((c) => c.id === channelId);
    } catch (err) {
      console.warn(`[DiscordChannel] ❌ Channel validation failed for Channel ID "${channelId}": ${err.message}`);
      return false;
    }
  }

  /**
   * Clear cache manually.
   */
  static clearCache(ownerId, credentialId, guildId) {
    if (ownerId && credentialId && guildId) {
      this.cache.delete(`${ownerId}:${credentialId}:${guildId}`);
    } else {
      this.cache.clear();
    }
  }
}
