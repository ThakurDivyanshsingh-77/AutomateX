export enum DiscordCreateChannelTypeEnum {
  TEXT = 0,
  VOICE = 2,
  CATEGORY = 4,
}

export interface IDiscordCreateChannelInput {
  credentialId: string;
  guildId: string;
  channelType: number | string;
  name: string;
  topic?: string;
  nsfw?: boolean;
  slowmode?: number;
  rate_limit_per_user?: number;
  parentId?: string;
  parent_id?: string;
  bitrate?: number;
  userLimit?: number;
  user_limit?: number;
}

export interface IDiscordCreateChannelResult {
  success: boolean;
  channel: {
    id: string;
    name: string;
    type: number;
    guildId: string;
    parentId?: string | null;
  };
  channelUrl?: string;
}
