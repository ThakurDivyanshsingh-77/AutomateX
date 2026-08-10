import { DiscordMemberService as JSDiscordMemberService } from './DiscordMemberService.js';

export class DiscordMemberService {
  static async getMembers(ownerId: string, credentialId: string, guildId: string, limit: number = 1000, bypassCache: boolean = false) {
    return await JSDiscordMemberService.getMembers(ownerId, credentialId, guildId, limit, bypassCache);
  }

  static async refreshMembers(ownerId: string, credentialId: string, guildId: string, limit: number = 1000) {
    return await JSDiscordMemberService.refreshMembers(ownerId, credentialId, guildId, limit);
  }

  static clearCache(ownerId?: string, credentialId?: string, guildId?: string) {
    JSDiscordMemberService.clearCache(ownerId, credentialId, guildId);
  }
}
