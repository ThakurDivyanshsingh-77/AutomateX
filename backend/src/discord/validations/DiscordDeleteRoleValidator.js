export class DiscordDeleteRoleValidator {
  /**
   * Validate Discord Delete Role request inputs.
   */
  static validate(input) {
    const errors = [];
    const config = input || {};

    const credentialId = config.credentialId || config.credential;
    if (!credentialId) {
      errors.push('Discord Credential selection is required.');
    }

    const guildId = String(config.guildId || config.guild || '').trim();
    const roleId = String(config.roleId || config.role || config.id || '').trim();
    const roleName = String(config.roleName || config.name || '').trim();

    if (!roleId) {
      errors.push('Discord Role selection or dynamic Role ID expression is required.');
    }

    // Check for @everyone role restriction
    if (
      (guildId && roleId && roleId === guildId) ||
      roleId.toLowerCase() === '@everyone' ||
      roleName.toLowerCase() === '@everyone'
    ) {
      errors.push('The @everyone role cannot be deleted.');
    }

    const confirmDelete = Boolean(
      config.confirmDelete === true || config.confirmDelete === 'true'
    );

    if (!confirmDelete) {
      errors.push('Confirmation is required. You must confirm role deletion before executing.');
    }

    const reason = config.reason ? String(config.reason).trim() : undefined;

    return {
      isValid: errors.length === 0,
      credentialId,
      guildId,
      roleId,
      roleName,
      confirmDelete,
      reason,
      errors,
    };
  }
}
