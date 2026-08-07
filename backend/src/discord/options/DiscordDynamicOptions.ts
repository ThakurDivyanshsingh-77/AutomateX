import { IDiscordGuildOption } from '../types/DiscordTypes.js';
import { IDiscordChannelDto } from '../types/DiscordChannelTypes.js';
import { DiscordGuildService } from '../services/DiscordGuildService.js';
import { DiscordChannelService } from '../services/DiscordChannelService.js';

export class DiscordDynamicOptions {
  /**
   * Fetch all Discord Guilds (servers) for a given credential ID.
   */
  public static async getGuilds(
    ownerId: string,
    credentialId: string,
    bypassCache = false
  ): Promise<IDiscordGuildOption[]> {
    const res = await DiscordGuildService.getGuilds(ownerId, credentialId, bypassCache);
    return res.guilds;
  }

  /**
   * Fetch all supported Discord Channels for a given guild ID.
   */
  public static async getChannels(
    ownerId: string,
    credentialId: string,
    guildId: string,
    bypassCache = false
  ): Promise<IDiscordChannelDto[]> {
    const res = await DiscordChannelService.getChannels(ownerId, credentialId, guildId, bypassCache);
    return res.channels;
  }

  public static clearGuildCache(ownerId?: string, credentialId?: string): void {
    DiscordGuildService.clearCache(ownerId, credentialId);
  }

  public static clearChannelCache(ownerId?: string, credentialId?: string, guildId?: string): void {
    DiscordChannelService.clearCache(ownerId, credentialId, guildId);
  }
}
