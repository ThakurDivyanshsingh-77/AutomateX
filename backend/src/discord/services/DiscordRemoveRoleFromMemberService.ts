import { DiscordRemoveRoleFromMemberService as JSRemoveRoleFromMemberService } from './DiscordRemoveRoleFromMemberService.js';
import { IDiscordRemoveRoleFromMemberInput, IDiscordRemoveRoleFromMemberResult } from '../types/DiscordRemoveRoleFromMemberTypes.js';

export class DiscordRemoveRoleFromMemberService {
  static async removeRoleFromMember(
    ownerId: string,
    credentialId: string,
    rawConfig: IDiscordRemoveRoleFromMemberInput
  ): Promise<IDiscordRemoveRoleFromMemberResult> {
    return await JSRemoveRoleFromMemberService.removeRoleFromMember(ownerId, credentialId, rawConfig);
  }
}
