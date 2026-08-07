import {
  IDiscordChannelDto,
  IDiscordChannelsResponse,
  IDiscordRawChannel,
} from '../types/DiscordChannelTypes.js';
import { DiscordCredentialService } from './DiscordCredentialService.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';
import { DiscordChannelMapper } from '../mappers/DiscordChannelMapper.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';

interface IChannelCacheEntry {
  timestamp: number;
  channels: IDiscordChannelDto[];
}

export class DiscordChannelService {
  private static cache = new Map<string, IChannelCacheEntry>();
  private static CACHE_TTL_MS = 60 * 1000; // 60s Cache TTL

  /**
   * Fetch all supported Discord Channels (GUILD_TEXT, GUILD_ANNOUNCEMENT, GUILD_FORUM) for a server.
   */
  public static async getChannels(
    ownerId: string,
    credentialId: string,
    guildId: string,
    bypassCache = false
  ): Promise<IDiscordChannelsResponse> {
    console.log(`[DiscordChannel] 🔑 Discord Credential Loaded: ${credentialId}`);
    console.log(`[DiscordChannel] 🏰 Guild Selected: ${guildId}`);

    if (!guildId) {
      throw new Error('guildId parameter is required to load channels');
    }

    const cacheKey = `${ownerId}:${credentialId}:${guildId}`;

    // 1. Check in-memory cache if bypassCache is false
    if (!bypassCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      const ageMs = Date.now() - cached.timestamp;
      if (ageMs < this.CACHE_TTL_MS) {
        console.log(`[DiscordChannel] ⚡ Returned ${cached.channels.length} Channels from cache`);
        return { success: true, channels: cached.channels };
      }
      this.cache.delete(cacheKey);
    }

    // 2. Fetch decrypted Bot token
    console.log('[DiscordChannel] 🔄 Loading Channels...');
    const botToken = await DiscordCredentialService.getDecryptedBotToken(ownerId, credentialId);

    // 3. Query Discord API GET /guilds/{guildId}/channels
    const client = new DiscordApiClient({ botToken });
    const rawChannels: IDiscordRawChannel[] = await client.getGuildChannels(guildId);

    // 4. Map and filter supported channels
    const channels: IDiscordChannelDto[] = DiscordChannelMapper.mapManyToDto(rawChannels);

    console.log(`[DiscordChannel] ✅ Found ${channels.length} Channels`);
    if (channels.length > 0) {
      const namesList = channels.slice(0, 5).map((c) => c.name).join(', ');
      console.log(`[DiscordChannel] 📋 Loaded: ${namesList}${channels.length > 5 ? '...' : ''}`);
    }

    // 5. Store in cache
    this.cache.set(cacheKey, {
      timestamp: Date.now(),
      channels,
    });

    return { success: true, channels };
  }

  /**
   * Refresh channels by invalidating cache and querying live Discord API.
   */
  public static async refreshChannels(
    ownerId: string,
    credentialId: string,
    guildId: string
  ): Promise<IDiscordChannelsResponse> {
    console.log(`[DiscordChannel] 🔄 Refreshing Channels for Guild ID: ${guildId}...`);
    this.cache.delete(`${ownerId}:${credentialId}:${guildId}`);
    return await this.getChannels(ownerId, credentialId, guildId, true);
  }

  /**
   * Validate whether a specific Channel ID exists in the Guild and is accessible.
   */
  public static async validateChannel(
    ownerId: string,
    credentialId: string,
    guildId: string,
    channelId: string
  ): Promise<boolean> {
    try {
      const res = await this.getChannels(ownerId, credentialId, guildId, false);
      return res.channels.some((c) => c.id === channelId);
    } catch (err) {
      console.warn(`[DiscordChannel] ❌ Channel validation failed for Channel ID "${channelId}": ${(err as Error).message}`);
      return false;
    }
  }

  /**
   * Invalidate cache for a specific guild or clear all channel caches.
   */
  public static clearCache(ownerId?: string, credentialId?: string, guildId?: string): void {
    if (ownerId && credentialId && guildId) {
      this.cache.delete(`${ownerId}:${credentialId}:${guildId}`);
    } else {
      this.cache.clear();
    }
  }
}
