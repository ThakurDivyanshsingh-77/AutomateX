import { IDiscordGuildOption, IDiscordGuild } from '../types/DiscordTypes.js';
import { DiscordCredentialService } from './DiscordCredentialService.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';

interface IGuildCacheEntry {
  timestamp: number;
  guilds: IDiscordGuildOption[];
}

export class DiscordGuildService {
  private static cache = new Map<string, IGuildCacheEntry>();
  private static CACHE_TTL_MS = 60 * 1000; // 60s Cache TTL

  /**
   * Fetch all Discord Guilds (servers) for a given credential ID.
   * Format output: { success: true, guilds: [ { id, name, icon } ] }
   */
  public static async getGuilds(
    ownerId: string,
    credentialId: string,
    bypassCache = false
  ): Promise<{ success: boolean; guilds: IDiscordGuildOption[] }> {
    console.log(`[DiscordGuild] 🔑 Discord Credential Loaded: ${credentialId}`);

    const cacheKey = `${ownerId}:${credentialId}`;
    if (!bypassCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      const ageMs = Date.now() - cached.timestamp;
      if (ageMs < this.CACHE_TTL_MS) {
        console.log(`[DiscordGuild] ⚡ Returned ${cached.guilds.length} Guilds from cache`);
        return { success: true, guilds: cached.guilds };
      }
      this.cache.delete(cacheKey);
    }

    console.log('[DiscordGuild] 🔄 Loading Guilds...');
    const botToken = await DiscordCredentialService.getDecryptedBotToken(ownerId, credentialId);

    const client = new DiscordApiClient({ botToken });
    const rawGuilds: IDiscordGuild[] = await client.getCurrentUserGuilds();

    const guilds: IDiscordGuildOption[] = rawGuilds.map((g) => ({
      id: g.id,
      name: g.name,
      label: g.name,
      value: g.id,
      iconUrl: DiscordUtils.getGuildIconUrl(g.id, g.icon),
      icon: DiscordUtils.getGuildIconUrl(g.id, g.icon),
    }));

    console.log(`[DiscordGuild] ✅ Found ${guilds.length} Guilds`);
    if (guilds.length > 0) {
      const namesList = guilds.slice(0, 5).map((g) => g.name).join(', ');
      console.log(`[DiscordGuild] 📋 Guild: ${namesList}${guilds.length > 5 ? '...' : ''}`);
    }

    this.cache.set(cacheKey, {
      timestamp: Date.now(),
      guilds,
    });

    return { success: true, guilds };
  }

  /**
   * Force refresh guilds by invalidating cache and re-querying Discord API.
   */
  public static async refreshGuilds(
    ownerId: string,
    credentialId: string
  ): Promise<{ success: boolean; guilds: IDiscordGuildOption[] }> {
    console.log(`[DiscordGuild] 🔄 Refreshing Guilds for Credential ID: ${credentialId}...`);
    this.cache.delete(`${ownerId}:${credentialId}`);
    return await this.getGuilds(ownerId, credentialId, true);
  }

  /**
   * Validate whether a specific Guild ID is accessible by the bot.
   */
  public static async validateGuild(
    ownerId: string,
    credentialId: string,
    guildId: string
  ): Promise<boolean> {
    try {
      const res = await this.getGuilds(ownerId, credentialId, false);
      return res.guilds.some((g) => g.id === guildId || g.value === guildId);
    } catch (err) {
      console.warn(`[DiscordGuild] ❌ Guild validation failed for Guild ID "${guildId}": ${(err as Error).message}`);
      return false;
    }
  }

  /**
   * Clear cache manually.
   */
  public static clearCache(ownerId?: string, credentialId?: string): void {
    if (ownerId && credentialId) {
      this.cache.delete(`${ownerId}:${credentialId}`);
    } else {
      this.cache.clear();
    }
  }
}
