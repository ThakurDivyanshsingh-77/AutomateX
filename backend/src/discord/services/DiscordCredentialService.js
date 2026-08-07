import { DiscordValidators } from '../validations/DiscordValidators.js';
import { DiscordApiClient } from '../client/DiscordApiClient.js';
import { DiscordUtils } from '../utils/DiscordUtils.js';
import { credentialService } from '../../credentials/credentialService.js';

export class DiscordCredentialService {
  /**
   * Validate a Discord Bot Token by invoking GET /users/@me
   */
  static async validateBotToken(botToken) {
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
      const user = await client.getCurrentUser();

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
    } catch (err) {
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
  static async createCredential(ownerId, input) {
    console.log(`[DiscordAuth] 🔒 Storing encrypted Discord credential for Connection Name: "${input.name}"...`);

    const validation = DiscordValidators.validateCredentialInput(input);
    if (!validation.isValid) {
      const err = new Error(`Validation failed: ${validation.errors.join(' ')}`);
      err.statusCode = 400;
      throw err;
    }

    const botInfo = await this.validateBotToken(input.botToken);
    if (!botInfo.valid) {
      const err = new Error(`Discord Bot Authentication failed: ${botInfo.error}`);
      err.statusCode = 401;
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
   * Get decrypted Discord Bot Token by Credential ID.
   */
  static async getDecryptedBotToken(ownerId, credentialId) {
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
