import {
  IDiscordBotCredentialInput,
  IDiscordCredentialValidationResult,
  IDiscordUser,
} from '../types/DiscordTypes.js';
import { DiscordValidators } from '../validations/DiscordValidators.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';
// @ts-ignore - Existing JS module
import { credentialService } from '../../credentials/credentialService.js';

export class DiscordCredentialService {
  /**
   * Validate a Discord Bot Token by invoking GET /users/@me
   * Returns bot user metadata (Bot Name, Bot ID, Avatar URL, Username).
   */
  public static async validateBotToken(botToken: string): Promise<IDiscordCredentialValidationResult> {
    console.log('[DiscordAuth] 🔐 Authentication started...');

    console.log('[DiscordAuth] 🔍 Token validation: Checking token format...');
    const tokenValidation = DiscordValidators.validateBotToken(botToken);
    if (!tokenValidation.isValid) {
      console.warn('[DiscordAuth] ❌ Authentication failed: Invalid token format.');
      return {
        valid: false,
        botName: '',
        botId: '',
        avatar: null,
        username: '',
        discriminator: '',
        error: tokenValidation.errors.join(' '),
      };
    }

    try {
      console.log('[DiscordAuth] 🌐 Discord API request: GET /users/@me');
      const client = new DiscordApiClient({ botToken });
      const user: IDiscordUser = await client.getCurrentUser();

      const botName = user.global_name || user.username;
      const avatarUrl = DiscordUtils.getAvatarUrl(user.id, user.avatar);

      console.log(`[DiscordAuth] ✅ Authentication successful! Authenticated Bot: "${botName}" (ID: ${user.id})`);

      return {
        valid: true,
        botName,
        botId: user.id,
        avatar: avatarUrl,
        username: user.username,
        discriminator: user.discriminator || '0',
        rawUser: user,
      };
    } catch (err: unknown) {
      const normalizedErr = DiscordUtils.normalizeDiscordError(err);
      console.warn(`[DiscordAuth] ❌ Authentication failed: ${normalizedErr.message}`);
      return {
        valid: false,
        botName: '',
        botId: '',
        avatar: null,
        username: '',
        discriminator: '',
        error: normalizedErr.message,
      };
    }
  }

  /**
   * Validate, encrypt, and store a Discord Bot Credential in AutomateX vault.
   */
  public static async createCredential(ownerId: string, input: IDiscordBotCredentialInput) {
    console.log(`[DiscordAuth] 🔒 Storing encrypted Discord credential for Connection Name: "${input.name}"...`);

    const validation = DiscordValidators.validateCredentialInput(input);
    if (!validation.isValid) {
      const err = new Error(`Validation failed: ${validation.errors.join(' ')}`);
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    const botInfo = await this.validateBotToken(input.botToken);
    if (!botInfo.valid) {
      const err = new Error(`Discord Bot Authentication failed: ${botInfo.error}`);
      (err as unknown as { statusCode: number }).statusCode = 401;
      throw err;
    }

    const secretPayload = {
      botToken: input.botToken.trim().replace(/^["']|["']$/g, ''),
      botId: botInfo.botId,
      botName: botInfo.botName,
      username: botInfo.username,
      avatar: botInfo.avatar,
      validatedAt: new Date().toISOString(),
    };

    const savedCred = await credentialService.createCredential(ownerId, {
      name: input.name.trim(),
      service: 'discord',
      authType: 'botToken',
      secret: secretPayload,
    });

    console.log(`[DiscordAuth] 💾 Encrypted credential successfully stored with ID: ${savedCred._id}`);

    return {
      credential: savedCred,
      botInfo: {
        botName: botInfo.botName,
        botId: botInfo.botId,
        avatar: botInfo.avatar,
        username: botInfo.username,
        discriminator: botInfo.discriminator,
      },
    };
  }

  /**
   * Get decrypted Discord Bot Token by Credential ID for a user.
   * Handles stringified JSON objects, double JSON strings, raw strings, wrapping quotes, and whitespace.
   */
  public static async getDecryptedBotToken(ownerId: string, credentialId: string): Promise<string> {
    let secret = await credentialService.getDecryptedSecret(ownerId, credentialId);
    if (!secret) {
      throw new Error(`Discord credential not found: ${credentialId}`);
    }

    // Recursively parse if stored as nested JSON string
    while (typeof secret === 'string') {
      try {
        const parsed = JSON.parse(secret);
        if (typeof parsed === 'object' && parsed !== null) {
          secret = parsed;
        } else if (typeof parsed === 'string') {
          secret = parsed;
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    let token = '';
    if (typeof secret === 'object' && secret !== null && (secret.botToken || secret.token)) {
      token = String(secret.botToken || secret.token);
    } else if (typeof secret === 'string') {
      token = secret;
    }

    token = token.trim().replace(/^["']|["']$/g, '');
    if (token.toLowerCase().startsWith('bot ')) {
      token = token.substring(4).trim();
    }

    if (!token) {
      throw new Error(`Invalid or empty Discord Bot Token extracted for Credential ID: ${credentialId}`);
    }

    return token;
  }
}
