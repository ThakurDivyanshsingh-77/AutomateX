export class DiscordCreateRoleValidator {
  /**
   * Validate Discord Create Role request inputs.
   */
  static validate(input) {
    const errors = [];
    const config = input || {};

    const credentialId = config.credentialId || config.credential;
    if (!credentialId) {
      errors.push('Discord Credential selection is required.');
    }

    const guildId = String(config.guildId || config.guild || '').trim();
    if (!guildId) {
      errors.push('Discord Server (Guild) selection is required.');
    }

    const rawName = String(config.name || config.roleName || '');
    const trimmedName = rawName.trim();
    if (!trimmedName) {
      errors.push('Role Name is required.');
    } else if (trimmedName.length > 100) {
      errors.push(`Role Name exceeds Discord limit of 100 characters (${trimmedName.length}/100).`);
    }

    // Convert HEX color string to integer color if provided
    let colorInt = 0;
    if (config.color !== undefined && config.color !== null && config.color !== '') {
      if (typeof config.color === 'number') {
        colorInt = config.color;
      } else {
        const hexStr = String(config.color).replace(/^#/, '').trim();
        if (/^[0-9A-Fa-f]{1,6}$/.test(hexStr)) {
          colorInt = parseInt(hexStr, 16);
        } else {
          errors.push(`Invalid HEX color format: "${config.color}". Use format like #5865F2.`);
        }
      }
    }

    const hoist = Boolean(config.hoist === true || config.hoist === 'true');
    const mentionable = Boolean(config.mentionable === true || config.mentionable === 'true');
    const reason = config.reason ? String(config.reason).trim() : undefined;

    return {
      isValid: errors.length === 0,
      credentialId,
      guildId,
      trimmedName,
      colorInt,
      hoist,
      mentionable,
      reason,
      errors,
    };
  }

  /**
   * Helper: Convert HEX string to Discord integer color
   * e.g. "#5865F2" -> 5793266
   */
  static hexToIntColor(hex) {
    if (!hex) return 0;
    if (typeof hex === 'number') return hex;
    const cleanHex = String(hex).replace(/^#/, '').trim();
    const parsed = parseInt(cleanHex, 16);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Helper: Convert Discord integer color to HEX string
   * e.g. 5793266 -> "#5865f2"
   */
  static intToHexColor(intColor) {
    if (intColor === undefined || intColor === null || isNaN(intColor) || intColor === 0) {
      return '#000000';
    }
    const hex = Number(intColor).toString(16).padStart(6, '0');
    return `#${hex}`;
  }
}
