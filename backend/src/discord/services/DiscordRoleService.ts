import { DiscordRoleService as JSDiscordRoleService } from './DiscordRoleService.js';

export class DiscordRoleService {
  static async getRoles(ownerId: string, credentialId: string, guildId: string, bypassCache: boolean = false) {
    return await JSDiscordRoleService.getRoles(ownerId, credentialId, guildId, bypassCache);
  }

  static async refreshRoles(ownerId: string, credentialId: string, guildId: string) {
    return await JSDiscordRoleService.refreshRoles(ownerId, credentialId, guildId);
  }

  static async validateRole(ownerId: string, credentialId: string, guildId: string, roleId: string) {
    return await JSDiscordRoleService.validateRole(ownerId, credentialId, guildId, roleId);
  }

  static clearCache(ownerId?: string, credentialId?: string, guildId?: string) {
    JSDiscordRoleService.clearCache(ownerId, credentialId, guildId);
  }
}
