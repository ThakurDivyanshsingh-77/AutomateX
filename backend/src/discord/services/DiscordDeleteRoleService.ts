import { DiscordDeleteRoleService as JSDeleteRoleService } from './DiscordDeleteRoleService.js';
import { IDiscordDeleteRoleInput, IDiscordDeleteRoleResult } from '../types/DiscordDeleteRoleTypes.js';

export class DiscordDeleteRoleService {
  static async deleteRole(
    ownerId: string,
    credentialId: string,
    rawConfig: IDiscordDeleteRoleInput
  ): Promise<IDiscordDeleteRoleResult> {
    return await JSDeleteRoleService.deleteRole(ownerId, credentialId, rawConfig);
  }
}
