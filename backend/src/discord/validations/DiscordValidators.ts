import { IDiscordBotCredentialInput } from '../types/DiscordTypes.js';

export interface IValidationResult {
  isValid: boolean;
  errors: string[];
}

export class DiscordValidators {
  /**
   * Validate Bot Token string format.
   */
  public static validateBotToken(token: string): IValidationResult {
    const errors: string[] = [];
    if (!token || typeof token !== 'string') {
      errors.push('Bot Token is required and must be a string.');
      return { isValid: false, errors };
    }

    const trimmed = token.trim();
    if (trimmed.length < 20) {
      errors.push('Bot Token is too short (minimum 20 characters).');
    }

    // Basic format validation: Discord tokens usually contain '.' or are alphanumeric base64-like strings
    if (trimmed.includes(' ') && !trimmed.toLowerCase().startsWith('bot ')) {
      errors.push('Bot Token cannot contain whitespace unless prefixed with "Bot ".');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Connection Name.
   */
  public static validateConnectionName(name: string): IValidationResult {
    const errors: string[] = [];
    if (!name || typeof name !== 'string') {
      errors.push('Connection Name is required.');
      return { isValid: false, errors };
    }

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      errors.push('Connection Name must be at least 2 characters.');
    }
    if (trimmed.length > 100) {
      errors.push('Connection Name cannot exceed 100 characters.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Discord Credential Input payload for Step 1.
   */
  public static validateCredentialInput(input: Partial<IDiscordBotCredentialInput>): IValidationResult {
    const errors: string[] = [];

    const nameResult = this.validateConnectionName(input.name || '');
    if (!nameResult.isValid) {
      errors.push(...nameResult.errors);
    }

    const tokenResult = this.validateBotToken(input.botToken || '');
    if (!tokenResult.isValid) {
      errors.push(...tokenResult.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
