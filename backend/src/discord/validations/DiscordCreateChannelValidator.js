import { DISCORD_CHANNEL_LIMITS } from '../types/DiscordCreateChannelTypes.js';

export class DiscordCreateChannelValidator {
  /**
   * Normalize and validate Channel Type input to numeric Discord channel type code (0, 2, 4).
   */
  static parseChannelType(typeInput) {
    if (typeInput === 0 || typeInput === '0' || typeInput === 'text' || typeInput === 'GUILD_TEXT') {
      return 0;
    }
    if (typeInput === 2 || typeInput === '2' || typeInput === 'voice' || typeInput === 'GUILD_VOICE') {
      return 2;
    }
    if (typeInput === 4 || typeInput === '4' || typeInput === 'category' || typeInput === 'GUILD_CATEGORY') {
      return 4;
    }
    return null;
  }

  /**
   * Validate Channel Name.
   */
  static validateChannelName(name) {
    const errors = [];
    if (name === undefined || name === null || typeof name !== 'string') {
      errors.push('Channel Name is required.');
      return { isValid: false, trimmedName: '', errors };
    }

    const trimmed = name.trim();
    if (trimmed.length < DISCORD_CHANNEL_LIMITS.NAME_MIN) {
      errors.push('Channel Name is required (minimum 1 character).');
    } else if (trimmed.length > DISCORD_CHANNEL_LIMITS.NAME_MAX) {
      errors.push(`Channel Name exceeds Discord limit of 100 characters (${trimmed.length}/100).`);
    }

    // Check for null characters or newline characters in channel names
    if (/[\0\r\n]/.test(trimmed)) {
      errors.push('Channel Name contains invalid whitespace or control characters.');
    }

    return {
      isValid: errors.length === 0,
      trimmedName: trimmed,
      errors,
    };
  }

  /**
   * Validate full channel creation request configuration.
   */
  static validate(input) {
    const errors = [];
    const config = input || {};

    if (!config.credentialId && !config.credential) {
      errors.push('Discord Credential selection is required.');
    }

    if (!config.guildId && !config.guild) {
      errors.push('Discord Server (Guild) selection is required.');
    }

    const parsedType = this.parseChannelType(config.channelType ?? config.type ?? 0);
    if (parsedType === null) {
      errors.push('Invalid Channel Type. Must be Text Channel (0), Voice Channel (2), or Category (4).');
    }

    const nameVal = this.validateChannelName(config.name || config.channelName || '');
    if (!nameVal.isValid) {
      errors.push(...nameVal.errors);
    }

    // Dynamic field validation per channel type
    if (parsedType === 0) {
      // Text Channel
      if (config.topic && typeof config.topic === 'string' && config.topic.length > DISCORD_CHANNEL_LIMITS.TOPIC_MAX) {
        errors.push(`Topic exceeds Discord limit of 1024 characters (${config.topic.length}/1024).`);
      }

      if (config.slowmode !== undefined && config.slowmode !== null && config.slowmode !== '') {
        const slowmodeNum = Number(config.slowmode);
        if (isNaN(slowmodeNum) || slowmodeNum < DISCORD_CHANNEL_LIMITS.SLOWMODE_MIN || slowmodeNum > DISCORD_CHANNEL_LIMITS.SLOWMODE_MAX) {
          errors.push(`Slowmode must be a valid number of seconds between 0 and 21600 (0 to 6 hours).`);
        }
      }
    } else if (parsedType === 2) {
      // Voice Channel
      if (config.bitrate !== undefined && config.bitrate !== null && config.bitrate !== '') {
        const bitrateNum = Number(config.bitrate);
        if (isNaN(bitrateNum) || bitrateNum < DISCORD_CHANNEL_LIMITS.BITRATE_MIN || bitrateNum > DISCORD_CHANNEL_LIMITS.BITRATE_MAX) {
          errors.push(`Bitrate must be between 8000 bps and 384000 bps (e.g. 64000).`);
        }
      }

      if (config.userLimit !== undefined && config.userLimit !== null && config.userLimit !== '') {
        const limitNum = Number(config.userLimit);
        if (isNaN(limitNum) || limitNum < DISCORD_CHANNEL_LIMITS.USER_LIMIT_MIN || limitNum > DISCORD_CHANNEL_LIMITS.USER_LIMIT_MAX) {
          errors.push(`User Limit must be between 0 (unlimited) and 99 users.`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      parsedType,
      trimmedName: nameVal.trimmedName,
      errors,
    };
  }
}
