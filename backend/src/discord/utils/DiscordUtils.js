export class DiscordUtils {
  /**
   * Format Discord Bot Authorization header.
   */
  static formatBotAuthHeader(token) {
    if (!token) return '';
    const cleanToken = token.trim();
    if (cleanToken.toLowerCase().startsWith('bot ')) {
      return cleanToken;
    }
    return `Bot ${cleanToken}`;
  }

  /**
   * Build Discord User / Bot Avatar URL on Discord CDN.
   */
  static getAvatarUrl(userId, avatarHash) {
    if (!avatarHash) {
      return 'https://cdn.discordapp.com/embed/avatars/0.png';
    }
    const extension = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${extension}`;
  }

  /**
   * Build Discord Guild (Server) Icon URL on Discord CDN.
   */
  static getGuildIconUrl(guildId, iconHash) {
    if (!iconHash) {
      return null;
    }
    const extension = iconHash.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${extension}`;
  }

  /**
   * Normalize any caught HTTP error or network failure.
   */
  static normalizeDiscordError(error) {
    if (typeof error === 'object' && error !== null && 'isNormalizedDiscordError' in error) {
      return error;
    }

    const defaultError = {
      statusCode: 500,
      message: 'An unexpected Discord API error occurred',
      isRateLimited: false,
      isAuthError: false,
      isPermissionError: false,
      isNotFoundError: false,
    };

    if (error instanceof Error) {
      defaultError.message = error.message;
    }

    if (typeof error === 'object' && error !== null) {
      const errObj = error;

      if (typeof errObj.status === 'number' || typeof errObj.statusCode === 'number') {
        const status = errObj.status || errObj.statusCode;
        defaultError.statusCode = status;

        if (status === 401) {
          defaultError.isAuthError = true;
          defaultError.message = '401 Unauthorized: Invalid Discord Bot Token';
        } else if (status === 403) {
          defaultError.isPermissionError = true;
          defaultError.message = '403 Forbidden: Missing required Discord permissions';
        } else if (status === 404) {
          defaultError.isNotFoundError = true;
          defaultError.message = '404 Not Found: Requested Discord resource does not exist';
        } else if (status === 429) {
          defaultError.isRateLimited = true;
          defaultError.message = '429 Rate Limited: Discord API rate limit hit';
          if (typeof errObj.retryAfterMs === 'number') {
            defaultError.retryAfterMs = errObj.retryAfterMs;
          }
        } else if (status >= 500) {
          defaultError.message = `${status} Discord Server Error: Discord API service is currently unavailable`;
        }
      }

      if (errObj.responseBody && typeof errObj.responseBody === 'object') {
        const discordErr = errObj.responseBody;
        if (discordErr.message) {
          defaultError.message = `${defaultError.message} - ${discordErr.message}`;
        }
        if (typeof discordErr.code === 'number') {
          defaultError.code = discordErr.code;
        }
        if (discordErr.retry_after && typeof discordErr.retry_after === 'number') {
          defaultError.retryAfterMs = Math.round(discordErr.retry_after * 1000);
        }
      }
    }

    return defaultError;
  }

  /**
   * Safely sleep / delay execution for retry mechanisms.
   */
  static async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
