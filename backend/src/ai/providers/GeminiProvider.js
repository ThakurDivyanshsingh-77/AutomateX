import { AIProvider } from './AIProvider.js';

export class GeminiProvider extends AIProvider {
  /**
   * Safe model normalization layer.
   * Trims whitespace, strips accidental "models/" prefix if present,
   * and preserves custom model identifiers (e.g. "gemini-2.5-flash", "gemini-2.0-flash").
   */
  static normalizeModelName(rawModel) {
    if (!rawModel || typeof rawModel !== 'string') {
      return 'gemini-1.5-flash';
    }
    let normalized = rawModel.trim();
    // Strip accidental outer quotes if present
    normalized = normalized.replace(/^["']|["']$/g, '').trim();
    // Strip accidental "models/" prefix if user typed or SDK added it twice
    if (normalized.toLowerCase().startsWith('models/')) {
      normalized = normalized.substring(7).trim();
    }
    return normalized || 'gemini-1.5-flash';
  }

  /**
   * Safely discover and validate model availability via GET /v1beta/models?key={apiKey}.
   * Returns list of available models that support generateContent.
   */
  static async validateModelAvailability(apiKey, requestedModel) {
    const cleanModel = GeminiProvider.normalizeModelName(requestedModel);
    const modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;

    try {
      const res = await fetch(modelsUrl);
      if (!res.ok) {
        console.warn(`[Gemini] ⚠️ Could not query models.list (HTTP ${res.status})`);
        return { isAvailable: false, supportsGenContent: false, availableModels: [] };
      }

      const data = await res.json();
      const rawModels = data.models || [];

      const availableModels = rawModels
        .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map((m) => {
          const name = m.name || '';
          return {
            fullName: name,
            cleanName: name.replace(/^models\//, ''),
            displayName: m.displayName || name,
          };
        });

      const foundObj = availableModels.find((m) => m.cleanName === cleanModel || m.fullName === `models/${cleanModel}`);

      const isAvailable = Boolean(foundObj);
      const supportsGenContent = Boolean(foundObj);

      return {
        isAvailable,
        supportsGenContent,
        modelDetails: foundObj,
        availableModels,
        totalModelsCount: rawModels.length,
      };
    } catch (err) {
      console.warn(`[Gemini] ⚠️ Error during models.list check: ${err.message}`);
      return { isAvailable: false, supportsGenContent: false, availableModels: [] };
    }
  }

  /**
   * Retrieve list of valid Gemini models supporting generateContent for an API key.
   */
  static async listAvailableModels(apiKey) {
    const { availableModels } = await GeminiProvider.validateModelAvailability(apiKey, '');
    return availableModels;
  }

  /**
   * Execute Google Gemini text generation via /v1beta/models/{model}:generateContent.
   */
  async generateText({ apiKey, model = 'gemini-1.5-flash', prompt, temperature = 0.7, maxTokens = 500, autoSelectModel = false }) {
    if (!apiKey) {
      const err = new Error('Gemini API Key is required for execution.');
      err.statusCode = 401;
      throw err;
    }

    if (!prompt || !String(prompt).trim()) {
      const err = new Error('Prompt cannot be empty.');
      err.statusCode = 400;
      throw err;
    }

    const requestedModel = GeminiProvider.normalizeModelName(model);
    let selectedModel = requestedModel;
    const autoSelect = Boolean(autoSelectModel);

    // Step 1: Query models.list for available generateContent models
    const discovery = await GeminiProvider.validateModelAvailability(apiKey, requestedModel);
    const availableModels = discovery.availableModels || [];

    const findBestFallback = (availableList, excludeModel = '') => {
      const availableNames = availableList.map((m) => m.cleanName || m);
      const textModels = availableNames.filter((name) =>
        !name.includes('image') &&
        !name.includes('tts') &&
        !name.includes('audio') &&
        !name.includes('robotics') &&
        !name.includes('banana') &&
        name !== excludeModel
      );

      const PRIORITY_FALLBACKS = [
        'gemini-3.6-flash',
        'gemini-3.5-flash',
        'gemini-3.5-flash-lite',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-2.0-flash-lite',
        'gemini-1.0-pro',
      ];

      const matched = PRIORITY_FALLBACKS.find((pref) => textModels.includes(pref) || availableNames.includes(pref));
      if (matched) return matched;
      if (textModels.length > 0) return textModels[0];
      if (availableNames.length > 0) return availableNames[0];
      return 'gemini-1.5-flash';
    };

    if (autoSelect) {
      if (availableModels.length === 0) {
        const err = new Error('No available Gemini model supports generateContent for this credential.');
        err.statusCode = 404;
        throw err;
      }
      const availableNames = availableModels.map((m) => m.cleanName);
      if (availableNames.includes(requestedModel)) {
        selectedModel = requestedModel;
      } else {
        selectedModel = findBestFallback(availableModels);
      }
    } else {
      if (discovery.isAvailable && discovery.supportsGenContent) {
        selectedModel = requestedModel;
      } else if (availableModels.length > 0) {
        selectedModel = findBestFallback(availableModels, requestedModel);
        console.warn(`[Gemini] ⚠️ Requested model "${requestedModel}" is unavailable for this credential. Falling back to available model "${selectedModel}".`);
      } else {
        selectedModel = requestedModel;
      }
    }

    // Normalize final selected model name
    selectedModel = GeminiProvider.normalizeModelName(selectedModel);

    // Safe required logging
    console.log(`[Gemini] Requested model: ${requestedModel}`);
    console.log(`[Gemini] Selected model: ${selectedModel}`);
    console.log(`[Gemini] Auto select: ${autoSelect}`);

    const parsedTemp = typeof temperature === 'number' ? temperature : parseFloat(temperature);
    const validTemp = isNaN(parsedTemp) ? 0.7 : Math.max(0, Math.min(2, parsedTemp));

    const parsedMaxTokens = typeof maxTokens === 'number' ? maxTokens : parseInt(maxTokens, 10);
    const validMaxTokens = isNaN(parsedMaxTokens) || parsedMaxTokens < 1 ? 500 : parsedMaxTokens;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: String(prompt),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: validTemp,
        maxOutputTokens: validMaxTokens,
      },
    };

    const executeApiCall = async (modelToUse) => {
      const cleanM = GeminiProvider.normalizeModelName(modelToUse);
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cleanM)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      console.log(`[GeminiProvider] 🌐 Requesting Google Gemini API (${cleanM})...`);

      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return { response: res, modelUsed: cleanM, duration: Date.now() - startTime };
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        if (fetchErr.name === 'AbortError') {
          const err = new Error('Gemini request timed out.');
          err.statusCode = 408;
          throw err;
        }
        const err = new Error(`Gemini provider network request failed: ${fetchErr.message}`);
        err.statusCode = 503;
        throw err;
      }
    };

    let { response, modelUsed, duration } = await executeApiCall(selectedModel);

    // If HTTP 404 or 400 model error occurs on primary attempt and availableModels exist, attempt automatic fallback retry
    if (!response.ok && (response.status === 404 || response.status === 400)) {
      let errData = {};
      try { errData = await response.clone().json(); } catch {}
      const providerMsg = errData?.error?.message || '';

      const isModelError =
        response.status === 404 ||
        providerMsg.includes('no longer available') ||
        providerMsg.includes('not found') ||
        providerMsg.includes('is invalid') ||
        providerMsg.includes('not supported for generateContent');

      if (isModelError && availableModels.length > 0) {
        const fallbackTarget = findBestFallback(availableModels, selectedModel);
        if (fallbackTarget && fallbackTarget !== selectedModel) {
          console.warn(`[GeminiProvider] ⚠️ Primary request to "${selectedModel}" returned model error (${providerMsg}). Retrying with available fallback model "${fallbackTarget}"...`);
          try {
            const retryObj = await executeApiCall(fallbackTarget);
            if (retryObj.response.ok) {
              response = retryObj.response;
              selectedModel = fallbackTarget;
              duration = retryObj.duration;
            }
          } catch (retryErr) {
            console.warn(`[GeminiProvider] Retry attempt with "${fallbackTarget}" failed: ${retryErr.message}`);
          }
        }
      }
    }

    console.log(`[GeminiDebug]
geminiResponseStatus: ${response.status}
requestDuration: ${duration}ms`);

    if (!response.ok) {
      let errData = {};
      try {
        errData = await response.json();
      } catch {
        const textErr = await response.text();
        errData = { error: { message: textErr } };
      }

      const status = response.status;
      const providerMsg = errData?.error?.message || response.statusText || 'Unknown Gemini API error';

      if (status === 401) {
        const err = new Error(`Gemini authentication failed: ${providerMsg}`);
        err.statusCode = 401;
        throw err;
      } else if (status === 403) {
        const err = new Error(`Gemini API permission denied: ${providerMsg}`);
        err.statusCode = 403;
        throw err;
      } else if (status === 404) {
        const err = new Error(`Selected Gemini model "${selectedModel}" is unavailable or invalid: ${providerMsg}`);
        err.statusCode = 404;
        throw err;
      } else if (status === 429) {
        const err = new Error(`Gemini rate limit reached: ${providerMsg}`);
        err.statusCode = 429;
        throw err;
      } else if (status === 400) {
        const err = new Error(`Gemini request configuration invalid: ${providerMsg}`);
        err.statusCode = 400;
        throw err;
      } else {
        const err = new Error(`Gemini request failed (${status}): ${providerMsg}`);
        err.statusCode = status;
        throw err;
      }
    }

    const data = await response.json();
    const candidatePart = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const generatedText = candidatePart || '';

    const usageMeta = data.usageMetadata || {};

    return {
      success: true,
      text: generatedText,
      provider: 'gemini',
      model: selectedModel,
      usage: {
        promptTokens: usageMeta.promptTokenCount ?? null,
        completionTokens: usageMeta.candidatesTokenCount ?? null,
        totalTokens: usageMeta.totalTokenCount ?? null,
      },
    };
  }
}
