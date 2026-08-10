export interface IDiscordDeleteRoleInput {
  credentialId: string;
  guildId?: string;
  roleId: string;
  reason?: string;
  confirmDelete: boolean;
}

export interface IDiscordDeleteRoleResult {
  success: boolean;
  deleted: boolean;
  role: {
    id: string;
    name: string;
    guildId: string;
  };
}
