export class DiscordRemoveRoleFromMemberValidator {
  /**
   * Validate Discord Remove Role from Member request inputs.
   */
  static validate(input) {
    const errors = [];
    const config = input || {};

    const credentialId = config.credentialId || config.credential;
    if (!credentialId) {
      errors.push('Discord Credential selection is required.');
    }

    const guildId = String(config.guildId || config.guild || '').trim();
    const userId = String(config.userId || config.memberId || config.member || config.user || '').trim();
    const roleId = String(config.roleId || config.role || config.id || '').trim();
    const roleName = String(config.roleName || config.name || '').trim();

    if (!userId) {
      errors.push('Discord Member selection or dynamic User/Member ID expression is required.');
    }

    if (!roleId) {
      errors.push('Discord Role selection or dynamic Role ID expression is required.');
    }

    // Check for @everyone role restriction
    if (
      (guildId && roleId && roleId === guildId) ||
      roleId.toLowerCase() === '@everyone' ||
      roleName.toLowerCase() === '@everyone'
    ) {
      errors.push('The @everyone role cannot be removed.');
    }

    const reason = config.reason ? String(config.reason).trim() : undefined;

    return {
      isValid: errors.length === 0,
      credentialId,
      guildId,
      userId,
      roleId,
      roleName,
      reason,
      errors,
    };
  }
}
