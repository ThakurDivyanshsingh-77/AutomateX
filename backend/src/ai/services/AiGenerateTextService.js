import { credentialService } from '../../credentials/credentialService.js';
import { OpenAIProvider } from '../providers/OpenAIProvider.js';
import { GeminiProvider } from '../providers/GeminiProvider.js';
import { AiGenerateTextValidator } from '../validations/AiGenerateTextValidator.js';
import { ExpressionEngine } from '../../engine/expression/ExpressionEngine.js';

export class AiGenerateTextService {
  /**
   * Execute AI → Generate Text service logic.
   *
   * @param {string} ownerId Authenticated owner/user ID
   * @param {string} credentialId AI Credential ID from vault
   * @param {Object} rawConfig Node execution configuration
   */
  static async generateText(ownerId, credentialId, rawConfig = {}) {
    const config = rawConfig.config || rawConfig.data || rawConfig;
    const targetCredId = credentialId || config.credentialId || config.credential;

    if (!ownerId || ownerId === 'system' || ownerId === 'undefined') {
      throw new Error('Security Error: Missing authenticated ownerId during AI text generation.');
    }

    if (!targetCredId) {
      throw new Error('AI credential is required.');
    }

    // Step 1: Resolve dynamic expression templates in prompt if context is present
    let resolvedPrompt = config.prompt || '';
    if (rawConfig.context && typeof resolvedPrompt === 'string' && resolvedPrompt.includes('{{')) {
      try {
        const resolvedConfig = ExpressionEngine.resolve(config, rawConfig.context);
        if (resolvedConfig && resolvedConfig.prompt) {
          resolvedPrompt = resolvedConfig.prompt;
        }
      } catch (exprErr) {
        console.warn(`[AiGenerateTextService] ⚠️ Expression resolution warning: ${exprErr.message}`);
      }
    }

    // Step 2: Input Validation
    const validation = AiGenerateTextValidator.validate({
      ...config,
      credentialId: targetCredId,
      prompt: resolvedPrompt,
    });

    if (!validation.isValid) {
      const firstError = validation.errors[0] || 'Invalid AI Generate Text configuration';
      console.warn(`[AiGenerateTextService] ❌ Validation Error: ${firstError}`);
      const err = new Error(firstError);
      err.statusCode = 400;
      throw err;
    }

    // Step 3: Decrypt Credential Securely
    console.log(`[AiGenerateTextService] 🔑 Loading AI Credential from Vault: ${targetCredId}`);
    const credInfo = await credentialService.getCredentialForExecution(targetCredId, ownerId);

    if (!credInfo || !credInfo.secret) {
      const err = new Error('AI authentication failed. Check your AI credential.');
      err.statusCode = 401;
      throw err;
    }

    // Extract API Key securely (string or object)
    let apiKey = '';
    if (typeof credInfo.secret === 'string') {
      apiKey = credInfo.secret;
    } else if (typeof credInfo.secret === 'object') {
      apiKey = credInfo.secret.apiKey || credInfo.secret.secretKey || credInfo.secret.token || credInfo.secret.key || '';
    }

    if (!apiKey || !String(apiKey).trim()) {
      const err = new Error('AI authentication failed. Decrypted credential contains no valid API key.');
      err.statusCode = 401;
      throw err;
    }

    const maskedKey = apiKey.length > 8 ? `${apiKey.slice(0, 4)}••••${apiKey.slice(-4)}` : '••••••••';
    console.log(`[AiGenerateTextService] 🤖 Authenticated AI Credential Name: "${credInfo.name}" (${maskedKey})`);

    // Step 4: Dispatch Provider
    const providerName = String(validation.provider || 'openai').toLowerCase();
    let providerImpl;

    if (providerName === 'openai') {
      providerImpl = new OpenAIProvider();
    } else if (providerName === 'gemini' || providerName === 'google') {
      providerImpl = new GeminiProvider();
    } else {
      const err = new Error(`AI provider "${providerName}" is not supported.`);
      err.statusCode = 400;
      throw err;
    }

    console.log(`[AiGenerateTextService] 🚀 Generating text with Provider: ${providerName.toUpperCase()}, Model: ${validation.model}`);
    console.log(`[AiGenerateTextService] 📝 Prompt Length: ${validation.prompt.length} chars, Temp: ${validation.temperature}, MaxTokens: ${validation.maxTokens}`);

    const result = await providerImpl.generateText({
      apiKey,
      model: validation.model,
      prompt: validation.prompt,
      temperature: validation.temperature,
      maxTokens: validation.maxTokens,
    });

    console.log(`[AiGenerateTextService] ✅ Text Generated Successfully (${result.text.length} chars output)`);
    if (result.usage && result.usage.totalTokens !== null) {
      console.log(`[AiGenerateTextService] 📊 Token Usage: Prompt ${result.usage.promptTokens}, Completion ${result.usage.completionTokens}, Total ${result.usage.totalTokens}`);
    }

    return {
      success: true,
      text: result.text,
      provider: result.provider,
      model: result.model,
      usage: result.usage || { promptTokens: null, completionTokens: null, totalTokens: null },
    };
  }
}
