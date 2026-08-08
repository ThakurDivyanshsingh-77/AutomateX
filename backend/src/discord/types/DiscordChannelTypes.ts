/**
 * Strict TypeScript Definitions for Discord Channels (Step 3)
 */

export type DiscordChannelTypeName = 'GUILD_TEXT' | 'GUILD_VOICE' | 'GUILD_CATEGORY' | 'GUILD_ANNOUNCEMENT' | 'GUILD_FORUM';

export enum DiscordChannelTypeEnum {
  GUILD_TEXT = 0,
  GUILD_VOICE = 2,
  GUILD_CATEGORY = 4,
  GUILD_ANNOUNCEMENT = 5,
  GUILD_FORUM = 15,
}

export interface IDiscordRawChannel {
  id: string;
  type: number;
  guild_id?: string;
  position?: number;
  permission_overwrites?: Array<Record<string, unknown>>;
  name: string;
  topic?: string | null;
  nsfw?: boolean;
  last_message_id?: string | null;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  recipients?: Array<Record<string, unknown>>;
  icon?: string | null;
  owner_id?: string;
  application_id?: string;
  parent_id?: string | null;
  last_pin_timestamp?: string | null;
  rtc_region?: string | null;
  video_quality_mode?: number;
  message_count?: number;
  member_count?: number;
  thread_metadata?: Record<string, unknown>;
  member?: Record<string, unknown>;
  default_auto_archive_duration?: number;
  permissions?: string;
  flags?: number;
  total_message_sent?: number;
}

export interface IDiscordChannelDto {
  id: string;
  name: string;
  type: DiscordChannelTypeName;
  typeId: number;
  parentId?: string | null;
  position?: number;
  topic?: string | null;
}

export interface IDiscordChannelsResponse {
  success: boolean;
  channels: IDiscordChannelDto[];
}
