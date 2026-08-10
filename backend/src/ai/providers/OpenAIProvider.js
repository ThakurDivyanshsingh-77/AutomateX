import { AIProvider } from './AIProvider.js';

export class OpenAIProvider extends AIProvider {
  /**
   * Execute OpenAI text generation via /v1/chat/completions.
   */
  async generateText({ apiKey, model = 'gpt-4o-mini', prompt, temperature = 0.7, maxTokens = 500 }) {
    if (!apiKey) {
      const err = new Error('OpenAI API Key is required for execution.');
      err.statusCode = 401;
      throw err;
    }

    if (!prompt || !String(prompt).trim()) {
      const err = new Error('Prompt cannot be empty.');
      err.statusCode = 400;
      throw err;
    }

    const endpoint = 'https://api.openai.com/v1/chat/completions';
    const selectedModel = model || 'gpt-4o-mini';

    const payload = {
      model: selectedModel,
      messages: [
        {
          role: 'user',
          content: String(prompt),
        },
      ],
      temperature: typeof temperature === 'number' ? temperature : parseFloat(temperature) || 0.7,
      max_tokens: typeof maxTokens === 'number' ? maxTokens : parseInt(maxTokens, 10) || 500,
    };

    console.log(`[OpenAIProvider] 🌐 Requesting OpenAI Chat Completion (${selectedModel})...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        const err = new Error('AI request timed out.');
        err.statusCode = 408;
        throw err;
      }
      const err = new Error(`AI provider network request failed: ${fetchErr.message}`);
      err.statusCode = 503;
      throw err;
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errData = {};
      try {
        errData = await response.json();
      } catch {
        const textErr = await response.text();
        errData = { error: { message: textErr } };
      }

      const status = response.status;
      const providerMsg = errData?.error?.message || response.statusText;

      if (status === 401) {
        const err = new Error('AI authentication failed. Check your AI credential.');
        err.statusCode = 401;
        throw err;
      } else if (status === 404) {
        const err = new Error(`Selected AI model "${selectedModel}" is invalid or unavailable.`);
        err.statusCode = 404;
        throw err;
      } else if (status === 429) {
        const err = new Error('AI provider rate limit reached. Please try again later.');
        err.statusCode = 429;
        throw err;
      } else if (status === 400) {
        const err = new Error(`Invalid request to OpenAI API: ${providerMsg}`);
        err.statusCode = 400;
        throw err;
      } else {
        const err = new Error(`AI provider API error (${status}): ${providerMsg}`);
        err.statusCode = status;
        throw err;
      }
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || '';
    const usageData = data.usage || {};

    return {
      success: true,
      text: generatedText,
      provider: 'openai',
      model: selectedModel,
      usage: {
        promptTokens: usageData.prompt_tokens ?? null,
        completionTokens: usageData.completion_tokens ?? null,
        totalTokens: usageData.total_tokens ?? null,
      },
    };
  }
}
