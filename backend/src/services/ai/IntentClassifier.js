/**
 * IntentClassifier.js
 * Intent Classification Subsystem for AutomateX AI Builder.
 * Classifies prompts into 5 categories before any workflow is generated:
 * 1. automation: Valid automation request (Trigger + Action)
 * 2. conversation: Casual conversation ("Hello", "Tell me a joke")
 * 3. knowledge: General knowledge questions ("What is React?", "Who is Elon Musk?")
 * 4. physical_action: Impossible physical world tasks ("Make me coffee", "Wash my car")
 * 5. unsupported_automation: Unsupported hardware/app automations ("Control my microwave", "Turn on TV")
 */

export class IntentClassifier {
  /**
   * Classify user prompt intent & confidence score
   */
  static classify(prompt) {
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return {
        isAutomation: false,
        category: 'conversation',
        confidenceScore: 0.0,
        message: this.getRejectionMessage('conversation'),
      };
    }

    const text = prompt.trim().toLowerCase();

    // 1. Check Physical Actions
    const physicalKeywords = [
      'coffee', 'tea', 'pizza', 'cook', 'bake', 'wash', 'clean', 'drive', 'bike', 'car',
      'dish', 'laundry', 'room', 'bed', 'food', 'lunch', 'dinner', 'breakfast', 'water plants',
      'cut hair', 'mow', 'grass', 'walk dog', 'feed cat'
    ];
    if (physicalKeywords.some((kw) => text.includes(kw) && !text.includes('send') && !text.includes('email'))) {
      return {
        isAutomation: false,
        category: 'physical_action',
        confidenceScore: 0.95,
        message: this.getRejectionMessage('physical_action'),
      };
    }

    // 2. Check Unsupported Automations (hardware/devices without integrations)
    const unsupportedKeywords = [
      'microwave', 'refrigerator', 'fridge', 'tv', 'television', 'washing machine',
      'fan', 'light bulb', 'ac', 'air conditioner', 'oven', 'toaster', 'vacuum', 'door lock'
    ];
    if (unsupportedKeywords.some((kw) => text.includes(kw))) {
      return {
        isAutomation: false,
        category: 'unsupported_automation',
        confidenceScore: 0.90,
        message: this.getRejectionMessage('unsupported_automation'),
      };
    }

    // 3. Check Casual Conversation
    const conversationKeywords = [
      'hello', 'hi', 'hey', 'greetings', 'how are you', 'who are you', 'tell me a joke',
      'joke', 'good morning', 'good evening', 'what is your name', 'are you human', 'what can you do'
    ];
    if (conversationKeywords.some((kw) => text === kw || text.startsWith('hello') || text.startsWith('hi ') || text.includes('tell me a joke') || text.includes('how are you'))) {
      return {
        isAutomation: false,
        category: 'conversation',
        confidenceScore: 0.95,
        message: this.getRejectionMessage('conversation'),
      };
    }

    // 4. Check Knowledge Questions
    const knowledgeKeywords = [
      'what is', 'who is', 'explain', 'tell me about', 'definition of', 'history of',
      'how does react work', 'what is mongodb', 'who is elon musk', 'who is virat kohli'
    ];
    if (knowledgeKeywords.some((kw) => text.startsWith(kw) || text.includes('who is') || text.includes('what is react'))) {
      // Exception: "what is the status of" or "explain how to build workflow" might be valid
      if (!text.includes('when') && !text.includes('send') && !text.includes('notify') && !text.includes('workflow')) {
        return {
          isAutomation: false,
          category: 'knowledge',
          confidenceScore: 0.92,
          message: this.getRejectionMessage('knowledge'),
        };
      }
    }

    // 5. Check Automation Intent & Trigger / Action Presence
    const triggerKeywords = [
      'when', 'every', 'if', 'on', 'schedule', 'cron', 'webhook', 'start', 'after', 'whenever', 'daily', 'hourly'
    ];
    const actionKeywords = [
      'send', 'email', 'gmail', 'notify', 'slack', 'discord', 'telegram', 'post', 'http', 'api', 'request',
      'log', 'save', 'database', 'mongo', 'insert', 'pdf', 'generate', 'groq', 'ai', 'call', 'fetch', 'fetch weather'
    ];

    const hasTrigger = triggerKeywords.some((kw) => text.includes(kw));
    const hasAction = actionKeywords.some((kw) => text.includes(kw));

    if (hasTrigger && hasAction) {
      return {
        isAutomation: true,
        category: 'automation',
        confidenceScore: 0.95,
        triggerDetected: true,
        actionDetected: true,
      };
    }

    if (hasTrigger || hasAction) {
      // Partial match: confidence is ~ 0.65 (< 70%)
      return {
        isAutomation: false,
        category: 'automation',
        confidenceScore: 0.65,
        triggerDetected: hasTrigger,
        actionDetected: hasAction,
        message: 'Did you mean an automation workflow? Please specify both a trigger (e.g. "When a user signs up") and an action (e.g. "send an email").',
      };
    }

    // Default fallback rejection
    return {
      isAutomation: false,
      category: 'conversation',
      confidenceScore: 0.30,
      message: this.getRejectionMessage('default'),
    };
  }

  static getRejectionMessage(category) {
    if (category === 'unsupported_automation') {
      return `Unsupported Automation.\nNo integration exists for hardware/smart home devices.\n\nPlease describe a supported software automation such as:\n• When a user signs up send an email.\n• Every morning send weather report.\n• Notify Slack after payment.`;
    }

    return `No automation workflow detected.\n\nPlease describe an automation such as:\n• When a user signs up send an email.\n• Every morning at 9 AM send weather report.\n• If payment succeeds notify Slack channel.`;
  }
}
