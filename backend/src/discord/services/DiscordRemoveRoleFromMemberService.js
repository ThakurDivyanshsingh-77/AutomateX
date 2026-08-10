import { DiscordCredentialService } from './DiscordCredentialService.js';
import { DiscordMemberService } from './DiscordMemberService.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';
import { DiscordRemoveRoleFromMemberValidator } from '../validations/DiscordRemoveRoleFromMemberValidator.js';

export class DiscordRemoveRoleFromMemberService {
  /**
   * Execute Discord → Remove Role from Member operation.
   *
   * @param {string} ownerId Authenticated owner/user ID
   * @param {string} credentialId Discord bot credential ID
   * @param {Object} rawConfig Role removal inputs
   */
  static async removeRoleFromMember(ownerId, credentialId, rawConfig = {}) {
    const config = rawConfig.config || rawConfig.data || rawConfig;
    const targetCredId = credentialId || config.credentialId || config.credential;

    if (!ownerId || ownerId === 'system' || ownerId === 'undefined') {
      throw new Error('Security Error: Missing authenticated ownerId during role removal.');
    }

    if (!targetCredId) {
      throw new Error('Discord Credential is required.');
    }

    let guildId = String(config.guildId || config.guild || '').trim();
    let userId = String(config.userId || config.memberId || config.member || config.user || config.id || '').trim();
    let roleId = String(config.roleId || config.role || '').trim();
    const reason = config.reason ? String(config.reason).trim() : undefined;
    const roleName = String(config.roleName || config.name || '').trim();

    // Dynamic Data Mapping Fallback: check if userId or roleId exists in previous step output (e.g. Add Role to Member)
    if ((!userId || !roleId) && rawConfig.context) {
      const lastOutput = typeof rawConfig.context.getLastStepOutput === 'function'
        ? rawConfig.context.getLastStepOutput()
        : null;
      if (lastOutput) {
        if (!userId) {
          if (lastOutput.userId) userId = String(lastOutput.userId);
          else if (lastOutput.user && lastOutput.user.id) userId = String(lastOutput.user.id);
          else if (lastOutput.member && lastOutput.member.id) userId = String(lastOutput.member.id);
        }
        if (!roleId) {
          if (lastOutput.roleId) roleId = String(lastOutput.roleId);
          else if (lastOutput.role && lastOutput.role.id) roleId = String(lastOutput.role.id);
        }
        if (!guildId && lastOutput.guildId) guildId = String(lastOutput.guildId);
      }
    }

    // Step 1: Validate Inputs
    const validation = DiscordRemoveRoleFromMemberValidator.validate({
      ...config,
      credentialId: targetCredId,
      guildId,
      userId,
      roleId,
      roleName,
    });

    if (!validation.isValid) {
      const firstError = validation.errors[0] || 'Invalid role removal configuration';
      console.warn(`[DiscordRemoveRoleFromMember] ❌ Validation Error: ${firstError}`);
      const err = new Error(firstError);
      err.statusCode = 400;
      throw err;
    }

    const finalGuildId = validation.guildId;
    const finalUserId = validation.userId;
    const finalRoleId = validation.roleId;

    // Step 2: Load Discord Credential
    console.log(`[DiscordRemoveRoleFromMember] 🔑 Discord Credential Loaded: ${targetCredId}`);
    const botToken = await DiscordCredentialService.getDecryptedBotToken(ownerId, targetCredId);

    if (!botToken) {
      const err = new Error('Discord bot token is invalid or expired.');
      err.statusCode = 401;
      throw err;
    }
    console.log('[DiscordRemoveRoleFromMember] 🤖 Bot Token Validated');

    console.log(`[DiscordRemoveRoleFromMember] 👤 Member User ID: ${finalUserId}`);
    console.log(`[DiscordRemoveRoleFromMember] 🛡️ Removing Role ID: ${finalRoleId}`);
    if (finalGuildId) {
      console.log(`[DiscordRemoveRoleFromMember] 🏰 Guild ID: ${finalGuildId}`);
    }

    const client = new DiscordApiClient({ botToken });

    // Step 3: Dispatch DELETE /guilds/{guildId}/members/{userId}/roles/{roleId}
    console.log('[DiscordRemoveRoleFromMember] 🌐 Removing Role from Member...');
    console.log(`[DiscordRemoveRoleFromMember] 📡 Discord API Request: DELETE /guilds/${finalGuildId}/members/${finalUserId}/roles/${finalRoleId}`);

    try {
      await client.removeRoleFromMember(finalGuildId, finalUserId, finalRoleId, reason);
    } catch (err) {
      const normalized = DiscordUtils.normalizeDiscordError(err);
      const statusCode = err?.statusCode || normalized?.statusCode || 500;

      if (statusCode === 403) {
        const errorMsg = 'Bot does not have permission to remove this role. Check Manage Roles permission and role hierarchy.';
        console.warn(`[DiscordRemoveRoleFromMember] 🚫 403 Forbidden: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 403;
        throw roleErr;
      } else if (statusCode === 404) {
        const errorMsg = 'Member or role not found, or the bot does not have access to this server.';
        console.warn(`[DiscordRemoveRoleFromMember] ❓ 404 Not Found: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 404;
        throw roleErr;
      } else if (statusCode === 401) {
        const errorMsg = 'Discord bot token is invalid or expired.';
        console.warn(`[DiscordRemoveRoleFromMember] 🔑 401 Unauthorized: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 401;
        throw roleErr;
      } else if (statusCode === 429) {
        const errorMsg = 'Discord rate limit reached. Please try again.';
        console.warn(`[DiscordRemoveRoleFromMember] ⏳ 429 Rate Limited: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 429;
        throw roleErr;
      } else if (statusCode === 400) {
        const errorMsg = normalized.message || 'Discord rejected the role removal configuration.';
        console.warn(`[DiscordRemoveRoleFromMember] ⚠️ 400 Bad Request: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 400;
        throw roleErr;
      }
      throw err;
    }

    console.log('[DiscordRemoveRoleFromMember] ✅ Role Removed from Member Successfully');
    console.log(`[DiscordRemoveRoleFromMember] 🆔 Role ID: ${finalRoleId} <- Member ID: ${finalUserId}`);

    // Step 4: Invalidate member cache in DiscordMemberService for the target Guild
    if (finalGuildId) {
      try {
        DiscordMemberService.clearCache(ownerId, targetCredId, finalGuildId);
        console.log(`[DiscordRemoveRoleFromMember] 🔄 Invalidated DiscordMemberService cache for Guild ${finalGuildId}`);
      } catch (cacheErr) {
        console.warn(`[DiscordRemoveRoleFromMember] ⚠️ Cache invalidation warning: ${cacheErr.message}`);
      }
    }

    console.log('[DiscordRemoveRoleFromMember] 🏁 Execution Finished');

    return {
      success: true,
      removed: true,
      guildId: finalGuildId,
      userId: finalUserId,
      roleId: finalRoleId,
    };
  }
}
