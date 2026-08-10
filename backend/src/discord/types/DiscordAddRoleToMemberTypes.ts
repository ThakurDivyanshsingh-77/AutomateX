export interface IDiscordAddRoleToMemberInput {
  credentialId: string;
  guildId?: string;
  userId?: string;
  memberId?: string;
  roleId: string;
  reason?: string;
}

export interface IDiscordAddRoleToMemberResult {
  success: boolean;
  added: boolean;
  guildId: string;
  userId: string;
  roleId: string;
}
