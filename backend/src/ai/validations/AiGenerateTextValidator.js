export class AiGenerateTextValidator {
  /**
   * Validate AI Generate Text input configuration.
   */
  static validate(input) {
    const errors = [];
    const config = input || {};

    const credentialId = config.credentialId || config.credential;
    if (!credentialId) {
      errors.push('AI credential is required.');
    }

    const provider = String(config.provider || 'openai').toLowerCase().trim();
    if (provider !== 'openai' && provider !== 'gemini' && provider !== 'google') {
      errors.push(`AI provider "${provider}" is currently not supported. Supported providers: "openai", "gemini".`);
    }

    const defaultModel = (provider === 'gemini' || provider === 'google') ? 'gemini-1.5-flash' : 'gpt-4o-mini';
    const model = String(config.model || config.modelIdentifier || defaultModel).trim();
    if (!model) {
      errors.push('AI model selection is required.');
    }

    const prompt = String(config.prompt || '').trim();
    if (!prompt) {
      errors.push('Prompt cannot be empty.');
    }

    let temperature = 0.7;
    if (config.temperature !== undefined && config.temperature !== null && config.temperature !== '') {
      const tempNum = parseFloat(config.temperature);
      if (isNaN(tempNum) || tempNum < 0 || tempNum > 2) {
        errors.push('Temperature must be a number between 0 and 2.');
      } else {
        temperature = tempNum;
      }
    }

    let maxTokens = 500;
    if (config.maxTokens !== undefined && config.maxTokens !== null && config.maxTokens !== '') {
      const tokensNum = parseInt(config.maxTokens, 10);
      if (isNaN(tokensNum) || tokensNum < 1) {
        errors.push('Max Tokens must be a positive integer.');
      } else {
        maxTokens = tokensNum;
      }
    }

    return {
      isValid: errors.length === 0,
      credentialId,
      provider,
      model,
      prompt,
      temperature,
      maxTokens,
      errors,
    };
  }
}
