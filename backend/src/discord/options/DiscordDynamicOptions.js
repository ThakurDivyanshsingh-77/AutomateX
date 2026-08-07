import { DiscordCredentialService } from '../services/DiscordCredentialService.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';

export class DiscordDynamicOptions {
  static guildsCache = new Map();
  static CACHE_TTL_MS = 60 * 1000;

  static async getGuilds(ownerId, credentialId, bypassCache = false) {
    console.log(`[DiscordGuilds] 🚀 Fetching Discord Guilds for Credential ID: "${credentialId}" (bypassCache: ${bypassCache})...`);

    const cacheKey = `${ownerId}:${credentialId}`;
    if (!bypassCache && this.guildsCache.has(cacheKey)) {
      const cached = this.guildsCache.get(cacheKey);
      const ageMs = Date.now() - cached.timestamp;
      if (ageMs < this.CACHE_TTL_MS) {
        console.log(`[DiscordGuilds] ⚡ Returned ${cached.data.length} guilds from in-memory cache (age: ${Math.round(ageMs / 1000)}s)`);
        return cached.data;
      }
      this.guildsCache.delete(cacheKey);
    }

    console.log(`[DiscordAuth] 🔑 Decrypting Bot token for credential ID: "${credentialId}"...`);
    const botToken = await DiscordCredentialService.getDecryptedBotToken(ownerId, credentialId);

    console.log('[DiscordGuilds] 🌐 Discord API request: GET /users/@me/guilds');
    const client = new DiscordApiClient({ botToken });
    const rawGuilds = await client.getCurrentUserGuilds();

    const options = rawGuilds.map((g) => ({
      label: g.name,
      value: g.id,
      iconUrl: DiscordUtils.getGuildIconUrl(g.id, g.icon),
      id: g.id,
      name: g.name,
    }));

    console.log(`[DiscordGuilds] ✅ Successfully fetched ${options.length} guilds for Credential ID: "${credentialId}"`);

    this.guildsCache.set(cacheKey, {
      timestamp: Date.now(),
      data: options,
    });

    return options;
  }

  static clearGuildCache(ownerId, credentialId) {
    if (ownerId && credentialId) {
      this.guildsCache.delete(`${ownerId}:${credentialId}`);
    } else {
      this.guildsCache.clear();
    }
  }

  static async getChannels() {
    throw new Error('Channel dynamic options will be implemented in Step 3');
  }
}
