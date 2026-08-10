import { DiscordCredentialService } from './DiscordCredentialService.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';

export class DiscordMemberService {
  static cache = new Map();
  static CACHE_TTL_MS = 60 * 1000;

  /**
   * Fetch all Discord Members for a server (guild).
   */
  static async getMembers(ownerId, credentialId, guildId, limit = 1000, bypassCache = false) {
    console.log(`[DiscordMember] 🔑 Discord Credential Loaded: ${credentialId}`);
    console.log(`[DiscordMember] 🏰 Guild Selected: ${guildId}`);

    if (!guildId) {
      throw new Error('guildId parameter is required to load members');
    }

    const cacheKey = `${ownerId}:${credentialId}:${guildId}:${limit}`;

    if (!bypassCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      const ageMs = Date.now() - cached.timestamp;
      if (ageMs < this.CACHE_TTL_MS) {
        console.log(`[DiscordMember] ⚡ Returned ${cached.members.length} Members from cache`);
        return { success: true, members: cached.members };
      }
      this.cache.delete(cacheKey);
    }

    console.log('[DiscordMember] 🔄 Loading Members...');
    const botToken = await DiscordCredentialService.getDecryptedBotToken(ownerId, credentialId);

    const client = new DiscordApiClient({ botToken });
    const rawMembers = await client.getGuildMembers(guildId, limit);

    const members = (Array.isArray(rawMembers) ? rawMembers : []).map((m) => {
      const userObj = m.user || {};
      const userId = userObj.id || m.id;
      const displayName = m.nick || userObj.global_name || userObj.username || 'Unknown Member';
      const username = userObj.username || '';
      
      return {
        id: userId,
        userId,
        username,
        displayName,
        label: `${displayName}${username ? ` (@${username})` : ''}`,
        value: userId,
        avatarUrl: DiscordUtils.getAvatarUrl(userId, userObj.avatar),
        isBot: Boolean(userObj.bot),
        roles: m.roles || [],
      };
    });

    console.log(`[DiscordMember] ✅ Found ${members.length} Members`);
    if (members.length > 0) {
      const namesList = members.slice(0, 5).map((m) => m.displayName).join(', ');
      console.log(`[DiscordMember] 📋 Loaded: ${namesList}${members.length > 5 ? '...' : ''}`);
    }

    this.cache.set(cacheKey, {
      timestamp: Date.now(),
      members,
    });

    return { success: true, members };
  }

  /**
   * Refresh members by invalidating cache.
   */
  static async refreshMembers(ownerId, credentialId, guildId, limit = 1000) {
    console.log(`[DiscordMember] 🔄 Refreshing Members for Guild ID: ${guildId}...`);
    this.cache.delete(`${ownerId}:${credentialId}:${guildId}:${limit}`);
    return await this.getMembers(ownerId, credentialId, guildId, limit, true);
  }

  /**
   * Clear cache manually.
   */
  static clearCache(ownerId, credentialId, guildId) {
    if (ownerId && credentialId && guildId) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${ownerId}:${credentialId}:${guildId}`)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}
