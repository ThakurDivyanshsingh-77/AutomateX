import { DiscordAddRoleToMemberService as JSAddRoleToMemberService } from './DiscordAddRoleToMemberService.js';
import { IDiscordAddRoleToMemberInput, IDiscordAddRoleToMemberResult } from '../types/DiscordAddRoleToMemberTypes.js';

export class DiscordAddRoleToMemberService {
  static async addRoleToMember(
    ownerId: string,
    credentialId: string,
    rawConfig: IDiscordAddRoleToMemberInput
  ): Promise<IDiscordAddRoleToMemberResult> {
    return await JSAddRoleToMemberService.addRoleToMember(ownerId, credentialId, rawConfig);
  }
}
