import { DiscordCredentialService } from './DiscordCredentialService.js';
import { DiscordRoleService } from './DiscordRoleService.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';
import { DiscordDeleteRoleValidator } from '../validations/DiscordDeleteRoleValidator.js';

export class DiscordDeleteRoleService {
  /**
   * Execute Discord → Delete Role operation.
   *
   * @param {string} ownerId Authenticated owner/user ID
   * @param {string} credentialId Discord bot credential ID
   * @param {Object} rawConfig Role deletion inputs
   */
  static async deleteRole(ownerId, credentialId, rawConfig = {}) {
    const config = rawConfig.config || rawConfig.data || rawConfig;
    const targetCredId = credentialId || config.credentialId || config.credential;

    if (!ownerId || ownerId === 'system' || ownerId === 'undefined') {
      throw new Error('Security Error: Missing authenticated ownerId during role deletion.');
    }

    if (!targetCredId) {
      throw new Error('Discord Credential is required.');
    }

    let roleId = String(config.roleId || config.role || config.id || '').trim();
    let guildId = String(config.guildId || config.guild || '').trim();
    const reason = config.reason ? String(config.reason).trim() : undefined;
    let roleName = String(config.roleName || config.name || '').trim();

    // Dynamic Data Mapping Fallback: check if role.id or roleId exists in previous step output
    if (!roleId && rawConfig.context) {
      const lastOutput = typeof rawConfig.context.getLastStepOutput === 'function'
        ? rawConfig.context.getLastStepOutput()
        : null;
      if (lastOutput) {
        if (lastOutput.role && lastOutput.role.id) {
          roleId = String(lastOutput.role.id);
          if (!guildId && lastOutput.role.guildId) guildId = String(lastOutput.role.guildId);
          if (!roleName && lastOutput.role.name) roleName = String(lastOutput.role.name);
        } else if (lastOutput.id) {
          roleId = String(lastOutput.id);
        }
      }
    }

    // Step 1: Validate Inputs & Confirmation Check
    const validation = DiscordDeleteRoleValidator.validate({
      ...config,
      credentialId: targetCredId,
      guildId,
      roleId,
      roleName,
    });

    if (!validation.isValid) {
      const firstError = validation.errors[0] || 'Invalid role deletion configuration';
      console.warn(`[DiscordDeleteRole] ❌ Validation Error: ${firstError}`);
      const err = new Error(firstError);
      err.statusCode = 400;
      throw err;
    }

    const finalRoleId = validation.roleId;
    const finalGuildId = validation.guildId;

    // Step 2: Load Discord Credential
    console.log(`[DiscordDeleteRole] 🔑 Discord Credential Loaded: ${targetCredId}`);
    const botToken = await DiscordCredentialService.getDecryptedBotToken(ownerId, targetCredId);

    if (!botToken) {
      const err = new Error('Discord bot token is invalid or expired.');
      err.statusCode = 401;
      throw err;
    }
    console.log('[DiscordDeleteRole] 🤖 Bot Token Validated');

    console.log(`[DiscordDeleteRole] 🗑️ Deleting Role ID: ${finalRoleId}`);
    if (finalGuildId) {
      console.log(`[DiscordDeleteRole] 🏰 Guild ID: ${finalGuildId}`);
    }

    const client = new DiscordApiClient({ botToken });

    // Try fetching existing role info for normalized output before deletion if guildId is available
    if (finalGuildId && !roleName) {
      try {
        const rolesRes = await DiscordRoleService.getRoles(ownerId, targetCredId, finalGuildId, false);
        const match = rolesRes.roles?.find((r) => r.id === finalRoleId);
        if (match) {
          roleName = match.name;
        }
      } catch {
        // Non-blocking if role fetch fails prior to deletion
      }
    }

    // Step 3: Dispatch DELETE /guilds/{guildId}/roles/{roleId}
    console.log('[DiscordDeleteRole] 🌐 Deleting Role...');
    console.log(`[DiscordDeleteRole] 📡 Discord API Request: DELETE /guilds/${finalGuildId}/roles/${finalRoleId}`);

    try {
      await client.deleteRole(finalGuildId, finalRoleId, reason);
    } catch (err) {
      const normalized = DiscordUtils.normalizeDiscordError(err);
      const statusCode = err?.statusCode || normalized?.statusCode || 500;

      if (statusCode === 403) {
        const errorMsg = 'Bot cannot manage this role. Check Manage Roles permission and role hierarchy.';
        console.warn(`[DiscordDeleteRole] 🚫 403 Forbidden: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 403;
        throw roleErr;
      } else if (statusCode === 404) {
        const errorMsg = 'Role not found. It may already have been deleted or the bot may not have access.';
        console.warn(`[DiscordDeleteRole] ❓ 404 Not Found: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 404;
        throw roleErr;
      } else if (statusCode === 401) {
        const errorMsg = 'Discord bot token is invalid or expired.';
        console.warn(`[DiscordDeleteRole] 🔑 401 Unauthorized: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 401;
        throw roleErr;
      } else if (statusCode === 429) {
        const errorMsg = 'Discord rate limit reached. Please try again.';
        console.warn(`[DiscordDeleteRole] ⏳ 429 Rate Limited: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 429;
        throw roleErr;
      } else if (statusCode === 400) {
        const errorMsg = normalized.message || 'Discord rejected the role deletion configuration.';
        console.warn(`[DiscordDeleteRole] ⚠️ 400 Bad Request: ${errorMsg}`);
        const roleErr = new Error(errorMsg);
        roleErr.statusCode = 400;
        throw roleErr;
      }
      throw err;
    }

    console.log('[DiscordDeleteRole] ✅ Role Deleted Successfully');
    console.log(`[DiscordDeleteRole] 🆔 Role ID: ${finalRoleId}`);

    // Step 4: Invalidate role cache in DiscordRoleService for the target Guild
    if (finalGuildId) {
      try {
        DiscordRoleService.clearCache(ownerId, targetCredId, finalGuildId);
        console.log(`[DiscordDeleteRole] 🔄 Invalidated DiscordRoleService cache for Guild ${finalGuildId}`);
      } catch (cacheErr) {
        console.warn(`[DiscordDeleteRole] ⚠️ Cache invalidation warning: ${cacheErr.message}`);
      }
    }

    console.log('[DiscordDeleteRole] 🏁 Execution Finished');

    return {
      success: true,
      deleted: true,
      role: {
        id: finalRoleId,
        name: roleName || `role-${finalRoleId}`,
        guildId: finalGuildId,
      },
    };
  }
}
