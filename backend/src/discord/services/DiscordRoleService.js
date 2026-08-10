import { DiscordCredentialService } from './DiscordCredentialService.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';

export class DiscordRoleService {
  static cache = new Map();
  static CACHE_TTL_MS = 60 * 1000;

  /**
   * Fetch all Discord Roles for a server (guild).
   */
  static async getRoles(ownerId, credentialId, guildId, bypassCache = false) {
    console.log(`[DiscordRole] 🔑 Discord Credential Loaded: ${credentialId}`);
    console.log(`[DiscordRole] 🏰 Guild Selected: ${guildId}`);

    if (!guildId) {
      throw new Error('guildId parameter is required to load roles');
    }

    const cacheKey = `${ownerId}:${credentialId}:${guildId}`;

    if (!bypassCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      const ageMs = Date.now() - cached.timestamp;
      if (ageMs < this.CACHE_TTL_MS) {
        console.log(`[DiscordRole] ⚡ Returned ${cached.roles.length} Roles from cache`);
        return { success: true, roles: cached.roles };
      }
      this.cache.delete(cacheKey);
    }

    console.log('[DiscordRole] 🔄 Loading Roles...');
    const botToken = await DiscordCredentialService.getDecryptedBotToken(ownerId, credentialId);

    const client = new DiscordApiClient({ botToken });
    const rawRoles = await client.getGuildRoles(guildId);

    const roles = (Array.isArray(rawRoles) ? rawRoles : []).map((r) => {
      const colorHex = r.color ? `#${r.color.toString(16).padStart(6, '0').toUpperCase()}` : '#99AAB5';
      return {
        id: r.id,
        name: r.name,
        label: r.name,
        value: r.id,
        color: r.color || 0,
        colorHex,
        hoist: Boolean(r.hoist),
        position: r.position || 0,
        permissions: r.permissions || '0',
        managed: Boolean(r.managed),
        mentionable: Boolean(r.mentionable),
        isEveryone: r.id === guildId || r.name === '@everyone',
      };
    });

    // Sort by position descending (highest position first)
    roles.sort((a, b) => b.position - a.position);

    console.log(`[DiscordRole] ✅ Found ${roles.length} Roles`);
    if (roles.length > 0) {
      const namesList = roles.slice(0, 5).map((r) => r.name).join(', ');
      console.log(`[DiscordRole] 📋 Loaded: ${namesList}${roles.length > 5 ? '...' : ''}`);
    }

    this.cache.set(cacheKey, {
      timestamp: Date.now(),
      roles,
    });

    return { success: true, roles };
  }

  /**
   * Refresh roles by invalidating cache.
   */
  static async refreshRoles(ownerId, credentialId, guildId) {
    console.log(`[DiscordRole] 🔄 Refreshing Roles for Guild ID: ${guildId}...`);
    this.cache.delete(`${ownerId}:${credentialId}:${guildId}`);
    return await this.getRoles(ownerId, credentialId, guildId, true);
  }

  /**
   * Validate whether a specific Role ID exists in the Guild.
   */
  static async validateRole(ownerId, credentialId, guildId, roleId) {
    try {
      const res = await this.getRoles(ownerId, credentialId, guildId, false);
      return res.roles.some((r) => r.id === roleId);
    } catch (err) {
      console.warn(`[DiscordRole] ❌ Role validation failed for Role ID "${roleId}": ${err.message}`);
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
