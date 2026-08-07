import { DiscordUtils } from '../utils/DiscordUtils.js';

export class DiscordApiClient {
  constructor(config) {
    if (!config.botToken) {
      throw new Error('DiscordApiClient initialized without botToken');
    }
    this.baseUrl = config.baseUrl || 'https://discord.com/api/v10';
    this.authHeader = DiscordUtils.formatBotAuthHeader(config.botToken);
    this.maxRetries = config.maxRetries ?? 3;
    this.timeoutMs = config.timeoutMs ?? 10000;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const headers = {
      'Authorization': this.authHeader,
      'Content-Type': 'application/json',
      'User-Agent': 'AutomateX-DiscordBot (https://github.com/ThakurDivyanshsingh-77/AutomateX, 1.0.0)',
      ...(options.headers || {}),
    };

    let attempt = 0;
    while (attempt <= this.maxRetries) {
      attempt++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          if (response.status === 204) {
            return {};
          }
          const data = await response.json();
          return data;
        }

        let responseBody;
        try {
          responseBody = await response.json();
        } catch {
          // Ignore JSON parse failures on non-ok responses
        }

        const statusCode = response.status;

        if (statusCode === 429) {
          const retryAfterSec = responseBody?.retry_after ?? 
            parseFloat(response.headers.get('Retry-After') || '1');
          const retryAfterMs = Math.ceil(retryAfterSec * 1000) + 100;

          if (attempt <= this.maxRetries) {
            console.warn(`[DiscordApiClient] 429 Rate limited on ${endpoint}. Retrying after ${retryAfterMs}ms (Attempt ${attempt}/${this.maxRetries})`);
            await DiscordUtils.sleep(retryAfterMs);
            continue;
          }
        }

        if (statusCode >= 500 && attempt <= this.maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 500;
          console.warn(`[DiscordApiClient] ${statusCode} Server Error on ${endpoint}. Retrying in ${backoffMs}ms (Attempt ${attempt}/${this.maxRetries})`);
          await DiscordUtils.sleep(backoffMs);
          continue;
        }

        const normalizedErr = DiscordUtils.normalizeDiscordError({
          status: statusCode,
          responseBody,
        });
        throw normalizedErr;

      } catch (err) {
        if (typeof err === 'object' && err !== null && 'statusCode' in err) {
          throw err;
        }

        if (attempt <= this.maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 500;
          console.warn(`[DiscordApiClient] Network/Fetch error on ${endpoint}: ${err.message}. Retrying in ${backoffMs}ms`);
          await DiscordUtils.sleep(backoffMs);
          continue;
        }

        throw DiscordUtils.normalizeDiscordError(err);
      }
    }

    throw DiscordUtils.normalizeDiscordError(new Error(`Failed request to ${endpoint} after ${this.maxRetries} attempts`));
  }

  async getCurrentUser() {
    return await this.request('/users/@me', {
      method: 'GET',
    });
  }

  async getCurrentUserGuilds() {
    return await this.request('/users/@me/guilds', {
      method: 'GET',
    });
  }

  async getGuildChannels(guildId) {
    if (!guildId) {
      throw new Error('getGuildChannels requires a valid guildId');
    }
    return await this.request(`/guilds/${guildId}/channels`, {
      method: 'GET',
    });
  }
}
