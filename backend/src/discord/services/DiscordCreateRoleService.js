import { DiscordCredentialService } from './DiscordCredentialService.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';
import { DiscordCreateRoleValidator } from '../validations/DiscordCreateRoleValidator.js';

export class DiscordCreateRoleService {
  /**
   * Execute Discord → Create Role operation.
   *
   * @param {string} ownerId Authenticated owner/user ID
   * @param {string} credentialId Discord bot credential ID
   * @param {Object} rawConfig Role creation inputs
   */
  static async createRole(ownerId, credentialId, rawConfig = {}) {
    const config = rawConfig.config || rawConfig.data || rawConfig;
    const targetCredId = credentialId || config.credentialId || config.credential;

    if (!ownerId || ownerId === 'system' || ownerId === 'undefined') {
      throw new Error('Security Error: Missing authenticated ownerId during role creation.');
    }

    if (!targetCredId) {
      throw new Error('Discord Credential is required.');
    }

    // Step 1: Validate Inputs
    const validation = DiscordCreateRoleValidator.validate({
      ...config,
      credentialId: targetCredId,
    });

    if (!validation.isValid) {
      const firstError = validation.errors[0] || 'Invalid role creation configuration';
      console.warn(`[DiscordCreateRole] ❌ Validation Error: ${firstError}`);
      const err = new Error(firstError);
      err.statusCode = 400;
      throw err;
    }

    const guildId = validation.guildId;
    const roleName = validation.trimmedName;
    const colorInt = validation.colorInt;
    const hoist = validation.hoist;
    const mentionable = validation.mentionable;
    const reason = validation.reason;

    // Step 2: Load Discord Credential
    console.log(`[DiscordCreateRole] 🔑 Discord Credential Loaded: ${targetCredId}`);
    const botToken = await DiscordCredentialService.getDecryptedBotToken(ownerId, targetCredId);

    if (!botToken) {
      const err = new Error('Discord bot token is invalid or expired.');
      err.statusCode = 401;
      throw err;
    }
    console.log('[DiscordCreateRole] 🤖 Bot Token Validated');

    console.log(`[DiscordCreateRole] 🏰 Server Guild ID: ${guildId}`);
    console.log(`[DiscordCreateRole] 🛡️ Creating Role Name: "${roleName}" (Color: ${colorInt}, Hoist: ${hoist}, Mentionable: ${mentionable})`);

    const client = new DiscordApiClient({ botToken });

    // Step 3: Build Payload & Dispatch POST /guilds/{guildId}/roles
    const payload = {
      name: roleName,
      color: colorInt,
      hoist,
      mentionable,
    };

    console.log('[DiscordCreateRole] 🌐 Creating Role...');
    console.log(`[DiscordCreateRole] 📡 Discord API Request: POST /guilds/${guildId}/roles`);

    let rawCreated;
    try {
      rawCreated = await client.createRole(guildId, payload, reason);
    } catch (err) {
      const normalized = DiscordUtils.normalizeDiscordError(err);
      const statusCode = err?.statusCode || normalized?.statusCode || 500;

      if (statusCode === 403) {
        const errorMsg = 'Discord bot does not have permission to create roles. Grant Manage Roles permission and try again.';
        console.warn(`[DiscordCreateRole] 🚫 403 Forbidden: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 403;
        throw roleErr;
      } else if (statusCode === 401) {
        const errorMsg = 'Discord bot token is invalid or expired.';
        console.warn(`[DiscordCreateRole] 🔑 401 Unauthorized: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 401;
        throw roleErr;
      } else if (statusCode === 404) {
        const errorMsg = 'Discord server not found or the bot no longer has access to it.';
        console.warn(`[DiscordCreateRole] ❓ 404 Not Found: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 404;
        throw roleErr;
      } else if (statusCode === 429) {
        const errorMsg = 'Discord rate limit reached. Please try again.';
        console.warn(`[DiscordCreateRole] ⏳ 429 Rate Limited: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 429;
        throw roleErr;
      } else if (statusCode === 400) {
        const errorMsg = normalized.message || 'Discord rejected the role creation configuration.';
        console.warn(`[DiscordCreateRole] ⚠️ 400 Bad Request: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 400;
        throw roleErr;
      }
      throw err;
    }

    console.log('[DiscordCreateRole] ✅ Role Created Successfully');
    console.log(`[DiscordCreateRole] 🆔 Role ID: ${rawCreated.id}`);

    console.log('[DiscordCreateRole] 🏁 Execution Finished');

    return {
      success: true,
      role: {
        id: rawCreated.id,
        name: rawCreated.name || roleName,
        guildId: guildId,
        color: rawCreated.color ?? colorInt,
        hoist: Boolean(rawCreated.hoist ?? hoist),
        mentionable: Boolean(rawCreated.mentionable ?? mentionable),
      },
      created: true,
    };
  }
}
