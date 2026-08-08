export interface IDiscordCreateRoleInput {
  credentialId: string;
  guildId: string;
  name: string;
  color?: string | number;
  hoist?: boolean;
  mentionable?: boolean;
  reason?: string;
}

export interface IDiscordCreateRoleResult {
  success: boolean;
  role: {
    id: string;
    name: string;
    guildId: string;
    color: number;
    hoist: boolean;
    mentionable: boolean;
  };
  created: boolean;
}
