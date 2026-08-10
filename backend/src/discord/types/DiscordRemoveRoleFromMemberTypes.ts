export interface IDiscordRemoveRoleFromMemberInput {
  credentialId: string;
  guildId?: string;
  userId?: string;
  memberId?: string;
  roleId: string;
  reason?: string;
}

export interface IDiscordRemoveRoleFromMemberResult {
  success: boolean;
  removed: boolean;
  guildId: string;
  userId: string;
  roleId: string;
}
