import { DiscordGuildService } from '../services/DiscordGuildService.js';
import { DiscordChannelService } from '../services/DiscordChannelService.js';

export class DiscordDynamicOptions {
  static async getGuilds(ownerId, credentialId, bypassCache = false) {
    const res = await DiscordGuildService.getGuilds(ownerId, credentialId, bypassCache);
    return res.guilds;
  }

  static async getChannels(ownerId, credentialId, guildId, bypassCache = false) {
    const res = await DiscordChannelService.getChannels(ownerId, credentialId, guildId, bypassCache);
    return res.channels;
  }

  static clearGuildCache(ownerId, credentialId) {
    DiscordGuildService.clearCache(ownerId, credentialId);
  }

  static clearChannelCache(ownerId, credentialId, guildId) {
    DiscordChannelService.clearCache(ownerId, credentialId, guildId);
  }
}
