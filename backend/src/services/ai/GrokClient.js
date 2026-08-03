/**
 * GrokClient — Grok / Groq / OpenAI API Integration.
 *
 * Automatically detects key type:
 * - Keys starting with "gsk_" → Groq API (https://api.groq.com/openai/v1/chat/completions, llama-3.3-70b-versatile)
 * - Keys starting with "xai-" → xAI API (https://api.x.ai/v1/chat/completions, grok-2-latest)
 * - Keys starting with "sk-"  → OpenAI API (https://api.openai.com/v1/chat/completions, gpt-4o-mini)
 */

export class GrokClient {
  static getApiKey() {
    return process.env.GROK_API_KEY || process.env.GROQ_API_KEY || process.env.XAI_API_KEY || process.env.OPENAI_API_KEY || null;
  }

  static isConfigured() {
    return Boolean(GrokClient.getApiKey());
  }

  static getEndpointAndModel(apiKey) {
    if (process.env.GROK_API_URL && process.env.GROK_MODEL) {
      return { endpoint: process.env.GROK_API_URL, model: process.env.GROK_MODEL };
    }

    if (apiKey && apiKey.startsWith('gsk_')) {
      return {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama-3.3-70b-versatile',
      };
    }

    if (apiKey && apiKey.startsWith('xai-')) {
      return {
        endpoint: 'https://api.x.ai/v1/chat/completions',
        model: 'grok-2-latest',
      };
    }

    // Default fallback to Groq endpoint for gsk_ keys or OpenAI format
    return {
      endpoint: process.env.GROK_API_URL || (apiKey?.startsWith('gsk_') ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.x.ai/v1/chat/completions'),
      model: process.env.GROK_MODEL || (apiKey?.startsWith('gsk_') ? 'llama-3.3-70b-versatile' : 'grok-2-latest'),
    };
  }

  /**
   * Send a prompt to AI API to generate a workflow graph JSON structure.
   *
   * @param {string} prompt - Natural language description
   * @returns {Promise<Object>} Formatted result { name, description, nodes, edges, variables, summary, warnings }
   */
  static async generateWorkflow(prompt) {
    const apiKey = GrokClient.getApiKey();
    if (!apiKey) {
      throw new Error('GROK_API_KEY is not configured in backend/.env');
    }

    const { endpoint, model } = GrokClient.getEndpointAndModel(apiKey);

    const systemPrompt = `You are AutomateX AI, an expert visual workflow architecture engine.
Your job is to convert natural language descriptions into valid JSON workflow definitions.

SUPPORTED NODE TYPES & CONFIG SCHEMAS:
- "start": Trigger node. Data: { label: "Start Trigger" }
- "webhook": Webhook trigger. Data: { label: "Webhook Trigger" }
- "cron": Schedule trigger. Data: { label: "Cron Schedule", config: { cronExpression: "0 9 * * *" } }
- "gmail": Send email. Data: { label: "Gmail Send Email", config: { to: "{{trigger.body.email}}", subject: "Subject", body: "Hello" } }
- "http": HTTP API call. Data: { label: "HTTP Request", config: { method: "GET"|"POST", url: "https://..." } }
- "slack": Send Slack message. Data: { label: "Slack Notification", config: { webhookUrl: "https://...", message: "Text" } }
- "discord": Send Discord message. Data: { label: "Discord Alert", config: { webhookUrl: "https://...", content: "Text" } }
- "telegram": Send Telegram message. Data: { label: "Telegram Message", config: { botToken: "...", chatId: "...", text: "Text" } }
- "delay": Pause workflow. Data: { label: "Delay", config: { seconds: 300 } }
- "log": Log message. Data: { label: "Logger", config: { message: "Result" } }
- "condition": IF branch. Data: { label: "IF Condition", config: { field: "body.event", operator: "equals", value: "signup" } }
- "tryCatch": Error handler. Data: { label: "Try / Catch" }
- "end": End workflow completion. Data: { label: "End" }

RULES:
1. First node MUST be a trigger: "start", "webhook", or "cron".
2. Last node MUST be "end".
3. Layout nodes horizontally: position.x increases by 250px for each step (e.g. x: 100, 350, 600...), y: 150.
4. For "condition" nodes, edges connected from condition MUST set sourceHandle: "true" or "false".
5. For "tryCatch" nodes, edges connected MUST set sourceHandle: "try" or "catch".
6. Edge format: { id: "e1", source: "node_id_1", target: "node_id_2", animated: true, style: { stroke: "#6366f1", strokeWidth: 2 } }

Respond ONLY with a valid JSON object strictly matching this schema (no markdown formatting, no backticks, just raw JSON):
{
  "name": "Short Workflow Name",
  "description": "Workflow summary",
  "nodes": [...],
  "edges": [...],
  "variables": [...],
  "summary": "Step-by-step description of what this generated workflow does",
  "warnings": []
}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Clean potential markdown fencing ```json ... ```
    const cleanedJson = content.replace(/^```(json)?\s*/i, '').replace(/\s*```$/, '').trim();

    try {
      return JSON.parse(cleanedJson);
    } catch (e) {
      throw new Error(`Failed to parse AI JSON output: ${e.message}. Content was: ${content.slice(0, 200)}`);
    }
  }

  /**
   * Ask AI to explain a workflow definition in plain English.
   */
  static async explainWorkflow(definition) {
    const apiKey = GrokClient.getApiKey();
    if (!apiKey) throw new Error('GROK_API_KEY not configured');

    const { endpoint, model } = GrokClient.getEndpointAndModel(apiKey);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are AutomateX AI. Explain the given workflow graph definition step-by-step in concise, clear, bulleted markdown plain English.',
          },
          {
            role: 'user',
            content: `Explain this workflow definition:\n${JSON.stringify(definition, null, 2)}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) throw new Error(`AI API Error: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No explanation generated.';
  }
}
