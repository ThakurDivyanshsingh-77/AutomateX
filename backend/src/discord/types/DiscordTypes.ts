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
