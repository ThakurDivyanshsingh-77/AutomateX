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
   * Execute Google Gemini text generation via /v1beta/models/{model}:generateContent.
   */
  async generateText({ apiKey, model = 'gemini-1.5-flash', prompt, temperature = 0.7, maxTokens = 500 }) {
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

    const selectedModel = GeminiProvider.normalizeModelName(model);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(selectedModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

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

    console.log(`[GeminiProvider] 🌐 Requesting Google Gemini API (${selectedModel})...`);

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
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
    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
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
