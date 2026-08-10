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

    // Robustly extract API Key securely (string, JSON object, or double-encoded string)
    let secretData = credInfo.secret;
    if (typeof secretData === 'string') {
      secretData = secretData.trim();
      if (secretData.startsWith('{') || secretData.startsWith('"')) {
        try {
          secretData = JSON.parse(secretData);
        } catch {
          // Keep as string if JSON.parse fails
        }
      }
    }

    let apiKey = '';
    if (typeof secretData === 'string') {
      apiKey = secretData.trim();
    } else if (typeof secretData === 'object' && secretData !== null) {
      apiKey = secretData.apiKey || secretData.secretKey || secretData.token || secretData.key || secretData.secret || secretData.connectionUri || secretData.botToken || '';
    }

    apiKey = String(apiKey || '').trim().replace(/^["']|["']$/g, '');

    if (!apiKey) {
      const err = new Error('AI authentication failed. Decrypted credential contains no valid API key.');
      err.statusCode = 401;
      throw err;
    }

    const maskedKey = apiKey.length > 8 ? `${apiKey.slice(0, 4)}••••${apiKey.slice(-4)}` : '••••••••';
    console.log(`[AiGenerateTextService] 🤖 Authenticated AI Credential Name: "${credInfo.name}" (${maskedKey})`);

    const providerName = String(validation.provider || 'openai').toLowerCase();

    if (providerName === 'gemini' || providerName === 'google') {
      console.log(`[GeminiDebug]
userId: present
credentialId: present
credentialOwnerMatches: true
provider: gemini
credentialFound: true
decryptedCredentialType: ${typeof credInfo.secret}
apiKeyExtracted: ${Boolean(apiKey && apiKey.length > 5)}
model: ${validation.model}
requestStarted: true`);
    }

    // Step 4: Dispatch Provider
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

  /**
   * Fetch list of available Gemini models for a specific user credential from vault.
   */
  static async getGeminiModels(ownerId, credentialId) {
    if (!ownerId || ownerId === 'system' || ownerId === 'undefined') {
      throw new Error('Security Error: Missing authenticated ownerId during Gemini models lookup.');
    }
    if (!credentialId) {
      throw new Error('Gemini credential ID is required.');
    }

    const credInfo = await credentialService.getCredentialForExecution(credentialId, ownerId);
    if (!credInfo || !credInfo.secret) {
      throw new Error('Gemini credential authorization failed.');
    }

    let secretData = credInfo.secret;
    if (typeof secretData === 'string') {
      secretData = secretData.trim();
      if (secretData.startsWith('{') || secretData.startsWith('"')) {
        try { secretData = JSON.parse(secretData); } catch {}
      }
    }

    let apiKey = typeof secretData === 'string' ? secretData : (secretData?.apiKey || secretData?.secret || '');
    apiKey = String(apiKey || '').trim().replace(/^["']|["']$/g, '');

    if (!apiKey) {
      throw new Error('Gemini API key is empty in decrypted credential.');
    }

    const models = await GeminiProvider.listAvailableModels(apiKey);
    return {
      success: true,
      models,
    };
  }
}
