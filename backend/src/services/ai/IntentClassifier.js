/**
 * IntentClassifier.js
 * Advanced Intent Classification for AutomateX AI Workflow Builder 2.0.
 *
 * Supported Intent Categories:
 * - AUTOMATION: Valid digital automation request (trigger + digital action).
 * - INFORMATIONAL: General knowledge or how-to queries (e.g. "How does GitHub work?").
 * - PHYSICAL_ACTION: Impossible physical actions (e.g. "Make a coffee", "Wash my car").
 * - IMPOSSIBLE: Absurd or physically impossible tasks (e.g. "Teleport to Mars", "Predict lottery").
 * - AMBIGUOUS: Underspecified requests needing parameters (e.g. "Send a message", "Send an email").
 * - UNSUPPORTED: Integrations/devices not available in AutomateX (e.g. "Notion", "Microwave").
 */

export class IntentClassifier {
  /**
   * Classify user prompt intent & extract structured metadata
   * @param {string} prompt
   * @returns {Object} Structured intent analysis
   */
  static classify(prompt) {
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return {
        intent: 'AMBIGUOUS',
        isAutomation: false,
        confidence: 0.0,
        explanation: 'Please provide a description of the automation you want to build.',
        suggestions: [
          'Every morning at 9 AM send me a Gmail report',
          'When a new GitHub repo is created, update my profile README',
          'When a webhook is received, send a Discord message',
        ],
      };
    }

    const text = prompt.trim();
    const lower = text.toLowerCase();

    // ─── 1. IMPOSSIBLE TASKS ──────────────────────────────────────────────────
    const impossiblePatterns = [
      /\bmars\b/i,
      /\bteleport\b/i,
      /\btime travel\b/i,
      /\bpredict lottery\b/i,
      /\bworld peace\b/i,
      /\bdivide by zero\b/i,
      /\bresurrect\b/i,
    ];
    if (impossiblePatterns.some((pattern) => pattern.test(lower))) {
      return {
        intent: 'IMPOSSIBLE',
        isAutomation: false,
        confidence: 0.99,
        explanation: 'This request involves tasks that are scientifically or technologically impossible.',
        suggestions: [
          'Schedule an API request or webhook',
          'Send daily notifications to Discord or Gmail',
        ],
      };
    }

    // ─── 2. PHYSICAL ACTIONS (Not digital automations) ─────────────────────────
    const physicalKeywords = [
      'coffee', 'tea', 'espresso', 'cook', 'bake', 'wash', 'clean', 'drive', 'bike', 'car',
      'dish', 'laundry', 'room', 'bed', 'food', 'lunch', 'dinner', 'breakfast', 'water plants',
      'cut hair', 'mow', 'grass', 'walk dog', 'feed cat', 'iron clothes', 'pack bags'
    ];
    const isPhysicalKeyword = physicalKeywords.some((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(lower);
    });

    // Check if the user is asking to physically DO the action vs digitally REMIND/NOTIFY about it
    const isNotificationOnly = lower.includes('remind') || lower.includes('alert') || lower.includes('notification') || lower.includes('email me to');
    if (isPhysicalKeyword && !isNotificationOnly) {
      return {
        intent: 'PHYSICAL_ACTION',
        isAutomation: false,
        confidence: 0.96,
        explanation: 'AutomateX is a digital workflow platform and cannot perform physical real-world actions directly.',
        suggestions: [
          'Send me a reminder notification to make coffee every morning at 9 AM',
          'Send a Discord alert for morning routine',
          'Send a webhook to a smart device API',
        ],
      };
    }

    // ─── 3. UNSUPPORTED INTEGRATIONS / DEVICES ────────────────────────────────
    const unsupportedIntegrations = [
      { name: 'Notion', regex: /\bnotion\b/i },
      { name: 'TikTok', regex: /\btiktok\b/i },
      { name: 'Instagram', regex: /\binstagram\b/i },
      { name: 'WhatsApp', regex: /\bwhatsapp\b/i },
      { name: 'Salesforce', regex: /\bsalesforce\b/i },
      { name: 'HubSpot', regex: /\bhubspot\b/i },
      { name: 'Airtable', regex: /\bairtable\b/i },
      { name: 'Trello', regex: /\btrello\b/i },
      { name: 'Asana', regex: /\basana\b/i },
      { name: 'Microwave', regex: /\bmicrowave\b/i },
      { name: 'Refrigerator', regex: /\brefrigerator|fridge\b/i },
      { name: 'Washing Machine', regex: /\bwashing machine\b/i },
      { name: 'TV', regex: /\btelevision|smart tv\b/i },
    ];
    const matchedUnsupported = unsupportedIntegrations.find((item) => item.regex.test(lower));
    if (matchedUnsupported) {
      return {
        intent: 'UNSUPPORTED',
        isAutomation: false,
        confidence: 0.94,
        unsupportedTarget: matchedUnsupported.name,
        explanation: `AutomateX does not currently have a native integration for ${matchedUnsupported.name}.`,
        suggestions: [
          'Use an HTTP Request node to call their public REST API or Webhook',
          'Use supported platforms like Discord, Gmail, Google Sheets, or GitHub',
        ],
      };
    }

    // ─── 4. INFORMATIONAL / KNOWLEDGE QUERIES ─────────────────────────────────
    const informationalPatterns = [
      /^how (do|does|can|to)\b/i,
      /^what (is|are|does)\b/i,
      /^who (is|was)\b/i,
      /^explain\b/i,
      /^tell me about\b/i,
      /^why (is|do|does)\b/i,
      /^difference between\b/i,
    ];
    const isInformational = informationalPatterns.some((pattern) => pattern.test(lower));
    const hasExplicitAutomationVerbs = lower.includes('when') || lower.includes('every') || lower.includes('schedule') || lower.includes('send') || lower.includes('trigger');

    if (isInformational && !hasExplicitAutomationVerbs) {
      return {
        intent: 'INFORMATIONAL',
        isAutomation: false,
        confidence: 0.92,
        explanation: 'This appears to be an informational question rather than an automation request.',
        suggestions: [
          'Ask questions about how to use AutomateX nodes in the documentation',
          'Describe a trigger and an action to create an executable workflow',
        ],
      };
    }

    // ─── 5. AMBIGUOUS / UNDERSPECIFIED AUTOMATIONS ─────────────────────────────
    const ultraVaguePrompts = [
      /^send a message$/i,
      /^send message$/i,
      /^send an email$/i,
      /^send email$/i,
      /^post something$/i,
      /^automate my work$/i,
      /^do something$/i,
      /^trigger workflow$/i,
      /^run a task$/i,
    ];
    if (ultraVaguePrompts.some((pattern) => pattern.test(lower))) {
      return {
        intent: 'AMBIGUOUS',
        isAutomation: false,
        confidence: 0.90,
        explanation: 'Your request is missing essential details such as the target destination (e.g. Discord, Gmail) or the message content.',
        suggestions: [
          'Send a Discord message to channel #general with "Good morning"',
          'Send a Gmail email to team@example.com with daily summary',
        ],
        missingFields: ['targetService', 'recipientOrChannel', 'content'],
      };
    }

    // ─── 6. VALID DIGITAL AUTOMATION DETECTION ────────────────────────────────
    const triggerKeywords = [
      'when', 'every', 'if', 'on', 'schedule', 'cron', 'webhook', 'start', 'whenever', 'daily', 'hourly', 'minutes'
    ];
    const actionKeywords = [
      'send', 'email', 'gmail', 'notify', 'slack', 'discord', 'telegram', 'post', 'http', 'api', 'request',
      'log', 'save', 'database', 'mongo', 'mongodb', 'pdf', 'generate', 'groq', 'ai', 'call', 'fetch',
      'sync', 'readme', 'activity', 'commit', 'sheet', 'sheets', 'append', 'extract'
    ];

    const hasTrigger = triggerKeywords.some((kw) => lower.includes(kw));
    const hasAction = actionKeywords.some((kw) => lower.includes(kw));

    if (hasTrigger || hasAction) {
      return {
        intent: 'AUTOMATION',
        isAutomation: true,
        confidence: hasTrigger && hasAction ? 0.96 : 0.82,
        explanation: 'Valid digital automation request detected.',
        triggerDetected: hasTrigger,
        actionDetected: hasAction,
      };
    }

    // Default fallback to ambiguous
    return {
      intent: 'AMBIGUOUS',
      isAutomation: false,
      confidence: 0.60,
      explanation: 'Could not confidently determine automation requirements. Please specify a trigger (e.g. "Every morning at 9 AM") and an action (e.g. "Send a Discord message").',
      suggestions: [
        'Every day at 9 AM send a Discord message',
        'When a webhook is received, insert document into MongoDB',
      ],
    };
  }
}
