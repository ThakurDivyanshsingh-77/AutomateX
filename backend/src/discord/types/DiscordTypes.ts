/**
 * Production Type Definitions for Discord Integration Module
 * Strict TypeScript - No 'any' types used.
 */

export interface IDiscordBotCredentialInput {
  name: string;
  botToken: string;
}

export interface IDiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string | null;
  accent_color?: number | null;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

export interface IDiscordCredentialValidationResult {
  valid: boolean;
  botName: string;
  botId: string;
  avatar: string | null;
  username: string;
  discriminator: string;
  rawUser?: IDiscordUser;
  error?: string;
}

export interface IDiscordApiErrorResponse {
  message: string;
  code: number;
  errors?: Record<string, unknown>;
  retry_after?: number;
  global?: boolean;
}

export interface IDiscordNormalizedError {
  statusCode: number;
  code?: number;
  message: string;
  details?: Record<string, unknown>;
  retryAfterMs?: number;
  isRateLimited: boolean;
  isAuthError: boolean;
  isPermissionError: boolean;
  isNotFoundError: boolean;
}

export interface IDiscordStoredCredentialPayload {
  name: string;
  botToken: string;
  botId: string;
  botName: string;
  username: string;
  avatar: string | null;
  validatedAt: string;
}

export interface IDiscordApiResponse<T> {
  success: boolean;
  data?: T;
  error?: IDiscordNormalizedError;
}

// ── Step 2 Types: Guilds ─────────────────────────────────────────

export interface IDiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
  permissions?: string;
  features?: string[];
  approximate_member_count?: number;
  approximate_presence_count?: number;
}

export interface IDiscordGuildOption {
  label: string;
  value: string;
  iconUrl: string | null;
  id: string;
  name: string;
  icon?: string | null;
}

// ── Step 4 Types: Send Message & Embeds ─────────────────────────────────────

export interface IDiscordEmbedFooter {
  text: string;
  icon_url?: string;
}

export interface IDiscordEmbedImage {
  url: string;
}

export interface IDiscordEmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
}

export interface IDiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface IDiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: IDiscordEmbedFooter;
  image?: IDiscordEmbedImage;
  thumbnail?: IDiscordEmbedImage;
  author?: IDiscordEmbedAuthor;
  fields?: IDiscordEmbedField[];
}

export interface IDiscordSendMessageInput {
  credentialId: string;
  guildId: string;
  channelId: string;
  content?: string;
  message?: string; // Fallback field alias
  embeds?: IDiscordEmbed[] | string;
  tts?: boolean;
  replyToMessageId?: string;
  allowedMentions?: Record<string, unknown>;
  suppressEmbeds?: boolean;
}

export interface IDiscordSendEmbedInput {
  credentialId: string;
  guildId: string;
  channelId: string;
  title?: string;
  description?: string;
  color?: string | number;
  url?: string;
  authorName?: string;
  authorUrl?: string;
  authorIconUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  footerText?: string;
  footerIconUrl?: string;
  timestamp?: boolean | string;
  fields?: IDiscordEmbedField[];
}

export interface IDiscordSendMessageResult {
  success: boolean;
  messageId: string;
  channelId: string;
  guildId: string;
  timestamp: string;
  messageUrl: string;
  rawMessage?: Record<string, unknown>;
}
