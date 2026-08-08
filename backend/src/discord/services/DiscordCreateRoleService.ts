import { DiscordCreateRoleService as JSCreateRoleService } from './DiscordCreateRoleService.js';
import { IDiscordCreateRoleInput, IDiscordCreateRoleResult } from '../types/DiscordCreateRoleTypes.js';

export class DiscordCreateRoleService {
  static async createRole(
    ownerId: string,
    credentialId: string,
    rawConfig: IDiscordCreateRoleInput
  ): Promise<IDiscordCreateRoleResult> {
    return await JSCreateRoleService.createRole(ownerId, credentialId, rawConfig);
  }
}
