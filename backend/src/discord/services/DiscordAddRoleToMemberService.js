import { DiscordCredentialService } from './DiscordCredentialService.js';
import { DiscordMemberService } from './DiscordMemberService.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';
import { DiscordAddRoleToMemberValidator } from '../validations/DiscordAddRoleToMemberValidator.js';

export class DiscordAddRoleToMemberService {
  /**
   * Execute Discord → Add Role to Member operation.
   *
   * @param {string} ownerId Authenticated owner/user ID
   * @param {string} credentialId Discord bot credential ID
   * @param {Object} rawConfig Role assignment inputs
   */
  static async addRoleToMember(ownerId, credentialId, rawConfig = {}) {
    const config = rawConfig.config || rawConfig.data || rawConfig;
    const targetCredId = credentialId || config.credentialId || config.credential;

    if (!ownerId || ownerId === 'system' || ownerId === 'undefined') {
      throw new Error('Security Error: Missing authenticated ownerId during role assignment.');
    }

    if (!targetCredId) {
      throw new Error('Discord Credential is required.');
    }

    let guildId = String(config.guildId || config.guild || '').trim();
    let userId = String(config.userId || config.memberId || config.member || config.user || config.id || '').trim();
    let roleId = String(config.roleId || config.role || '').trim();
    const reason = config.reason ? String(config.reason).trim() : undefined;
    const roleName = String(config.roleName || config.name || '').trim();

    // Dynamic Data Mapping Fallback: check if user.id or role.id exists in previous step output
    if ((!userId || !roleId) && rawConfig.context) {
      const lastOutput = typeof rawConfig.context.getLastStepOutput === 'function'
        ? rawConfig.context.getLastStepOutput()
        : null;
      if (lastOutput) {
        if (!userId) {
          if (lastOutput.user && lastOutput.user.id) userId = String(lastOutput.user.id);
          else if (lastOutput.member && lastOutput.member.id) userId = String(lastOutput.member.id);
          else if (lastOutput.userId) userId = String(lastOutput.userId);
        }
        if (!roleId) {
          if (lastOutput.role && lastOutput.role.id) roleId = String(lastOutput.role.id);
          else if (lastOutput.roleId) roleId = String(lastOutput.roleId);
        }
        if (!guildId && lastOutput.guildId) guildId = String(lastOutput.guildId);
      }
    }

    // Step 1: Validate Inputs & Confirmation Check
    const validation = DiscordAddRoleToMemberValidator.validate({
      ...config,
      credentialId: targetCredId,
      guildId,
      userId,
      roleId,
      roleName,
    });

    if (!validation.isValid) {
      const firstError = validation.errors[0] || 'Invalid role assignment configuration';
      console.warn(`[DiscordAddRoleToMember] ❌ Validation Error: ${firstError}`);
      const err = new Error(firstError);
      err.statusCode = 400;
      throw err;
    }

    const finalGuildId = validation.guildId;
    const finalUserId = validation.userId;
    const finalRoleId = validation.roleId;

    // Step 2: Load Discord Credential
    console.log(`[DiscordAddRoleToMember] 🔑 Discord Credential Loaded: ${targetCredId}`);
    const botToken = await DiscordCredentialService.getDecryptedBotToken(ownerId, targetCredId);

    if (!botToken) {
      const err = new Error('Discord bot token is invalid or expired.');
      err.statusCode = 401;
      throw err;
    }
    console.log('[DiscordAddRoleToMember] 🤖 Bot Token Validated');

    console.log(`[DiscordAddRoleToMember] 👤 Member User ID: ${finalUserId}`);
    console.log(`[DiscordAddRoleToMember] 🛡️ Assigning Role ID: ${finalRoleId}`);
    if (finalGuildId) {
      console.log(`[DiscordAddRoleToMember] 🏰 Guild ID: ${finalGuildId}`);
    }

    const client = new DiscordApiClient({ botToken });

    // Step 3: Dispatch PUT /guilds/{guildId}/members/{userId}/roles/{roleId}
    console.log('[DiscordAddRoleToMember] 🌐 Assigning Role to Member...');
    console.log(`[DiscordAddRoleToMember] 📡 Discord API Request: PUT /guilds/${finalGuildId}/members/${finalUserId}/roles/${finalRoleId}`);

    try {
      await client.addRoleToMember(finalGuildId, finalUserId, finalRoleId, reason);
    } catch (err) {
      const normalized = DiscordUtils.normalizeDiscordError(err);
      const statusCode = err?.statusCode || normalized?.statusCode || 500;

      if (statusCode === 403) {
        const errorMsg = 'Discord bot cannot assign this role. Check Manage Roles permission and make sure the role is below the bot\'s highest role.';
        console.warn(`[DiscordAddRoleToMember] 🚫 403 Forbidden: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 403;
        throw roleErr;
      } else if (statusCode === 404) {
        const errorMsg = 'Member or role not found, or the bot does not have access to this server.';
        console.warn(`[DiscordAddRoleToMember] ❓ 404 Not Found: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 404;
        throw roleErr;
      } else if (statusCode === 401) {
        const errorMsg = 'Discord bot token is invalid or expired.';
        console.warn(`[DiscordAddRoleToMember] 🔑 401 Unauthorized: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 401;
        throw roleErr;
      } else if (statusCode === 429) {
        const errorMsg = 'Discord rate limit reached. Please try again.';
        console.warn(`[DiscordAddRoleToMember] ⏳ 429 Rate Limited: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 429;
        throw roleErr;
      } else if (statusCode === 400) {
        const errorMsg = normalized.message || 'Discord rejected the role assignment configuration.';
        console.warn(`[DiscordAddRoleToMember] ⚠️ 400 Bad Request: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 400;
        throw roleErr;
      }
      throw err;
    }

    console.log('[DiscordAddRoleToMember] ✅ Role Assigned to Member Successfully');
    console.log(`[DiscordAddRoleToMember] 🆔 Role ID: ${finalRoleId} -> Member ID: ${finalUserId}`);

    // Step 4: Invalidate member cache in DiscordMemberService for the target Guild
    if (finalGuildId) {
      try {
        DiscordMemberService.clearCache(ownerId, targetCredId, finalGuildId);
        console.log(`[DiscordAddRoleToMember] 🔄 Invalidated DiscordMemberService cache for Guild ${finalGuildId}`);
      } catch (cacheErr) {
        console.warn(`[DiscordAddRoleToMember] ⚠️ Cache invalidation warning: ${cacheErr.message}`);
      }
    }

    console.log('[DiscordAddRoleToMember] 🏁 Execution Finished');

    return {
      success: true,
      added: true,
      guildId: finalGuildId,
      userId: finalUserId,
      roleId: finalRoleId,
    };
  }
}
