/**
  * Base Abstract AI Provider class.
  */
export class AIProvider {
  /**
   * Abstract method for generating text.
   * Must be implemented by provider classes (e.g., OpenAIProvider).
   *
   * @param {Object} options Options object containing apiKey, model, prompt, temperature, maxTokens
   * @returns {Promise<Object>} Normalized output { success, text, provider, model, usage }
   */
  async generateText(options) {
    throw new Error('generateText() must be implemented by subclass provider.');
  }
}
