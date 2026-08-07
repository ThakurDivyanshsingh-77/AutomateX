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
    const tokenValidation = DiscordValidators.validateBotToken(botToken);
    if (!tokenValidation.isValid) {
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
      const client = new DiscordApiClient({ botToken });
      const user: IDiscordUser = await client.getCurrentUser();

      const botName = user.global_name || user.username;
      const avatarUrl = DiscordUtils.getAvatarUrl(user.id, user.avatar);

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
      botToken: input.botToken.trim(),
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
   */
  public static async getDecryptedBotToken(ownerId: string, credentialId: string): Promise<string> {
    const secret = await credentialService.getDecryptedSecret(ownerId, credentialId);
    if (!secret) {
      throw new Error(`Discord credential not found: ${credentialId}`);
    }
    if (typeof secret === 'object' && secret.botToken) {
      return secret.botToken;
    }
    if (typeof secret === 'string') {
      return secret;
    }
    throw new Error(`Invalid Discord credential format stored for ID: ${credentialId}`);
  }
}
