import { IDiscordGuildOption, IDiscordGuild } from '../types/DiscordTypes.js';
import { DiscordCredentialService } from '../services/DiscordCredentialService.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';

interface ICacheEntry<T> {
  timestamp: number;
  data: T;
}

export class DiscordDynamicOptions {
  private static guildsCache = new Map<string, ICacheEntry<IDiscordGuildOption[]>>();
  private static CACHE_TTL_MS = 60 * 1000; // 60 Seconds TTL

  /**
   * Fetch all Discord Guilds (servers) for a given credential ID.
   * Populates server dropdown dynamically.
   * Includes short-lived in-memory caching with manual refresh support.
   */
  public static async getGuilds(
    ownerId: string,
    credentialId: string,
    bypassCache = false
  ): Promise<IDiscordGuildOption[]> {
    console.log(`[DiscordGuilds] 🚀 Fetching Discord Guilds for Credential ID: "${credentialId}" (bypassCache: ${bypassCache})...`);

    // 1. Check in-memory cache if bypassCache is false
    const cacheKey = `${ownerId}:${credentialId}`;
    if (!bypassCache && this.guildsCache.has(cacheKey)) {
      const cached = this.guildsCache.get(cacheKey)!;
      const ageMs = Date.now() - cached.timestamp;
      if (ageMs < this.CACHE_TTL_MS) {
        console.log(`[DiscordGuilds] ⚡ Returned ${cached.data.length} guilds from in-memory cache (age: ${Math.round(ageMs / 1000)}s)`);
        return cached.data;
      }
      this.guildsCache.delete(cacheKey);
    }

    // 2. Fetch decrypted Bot token
    console.log(`[DiscordAuth] 🔑 Decrypting Bot token for credential ID: "${credentialId}"...`);
    const botToken = await DiscordCredentialService.getDecryptedBotToken(ownerId, credentialId);

    // 3. Invoke Discord API GET /users/@me/guilds
    console.log('[DiscordGuilds] 🌐 Discord API request: GET /users/@me/guilds');
    const client = new DiscordApiClient({ botToken });
    const rawGuilds: IDiscordGuild[] = await client.getCurrentUserGuilds();

    // 4. Map into clean typed IDiscordGuildOption[]
    const options: IDiscordGuildOption[] = rawGuilds.map((g) => ({
      label: g.name,
      value: g.id,
      iconUrl: DiscordUtils.getGuildIconUrl(g.id, g.icon),
      id: g.id,
      name: g.name,
    }));

    console.log(`[DiscordGuilds] ✅ Successfully fetched ${options.length} guilds for Credential ID: "${credentialId}"`);

    // 5. Store in cache
    this.guildsCache.set(cacheKey, {
      timestamp: Date.now(),
      data: options,
    });

    return options;
  }

  /**
   * Clear cached guilds for a specific credential or all credentials.
   */
  public static clearGuildCache(ownerId?: string, credentialId?: string): void {
    if (ownerId && credentialId) {
      this.guildsCache.delete(`${ownerId}:${credentialId}`);
    } else {
      this.guildsCache.clear();
    }
  }

  public static async getChannels(): Promise<Array<{ label: string; value: string }>> {
    throw new Error('Channel dynamic options will be implemented in Step 3');
  }
}
