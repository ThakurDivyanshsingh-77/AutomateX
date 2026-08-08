export interface IDiscordDeleteChannelInput {
  credentialId: string;
  guildId?: string;
  channelId: string;
  confirmDelete: boolean;
}

export interface IDiscordDeleteChannelResult {
  success: boolean;
  channel: {
    id: string;
    name: string;
    guildId?: string;
  };
  deleted: boolean;
}
