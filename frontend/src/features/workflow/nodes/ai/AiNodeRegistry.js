import { Sparkles } from 'lucide-react';

export const AI_NODE_TYPES = {
  GENERATE_TEXT: 'aiGenerateText',
  AI: 'ai',
};

export const aiGenerateTextValidator = (config) => {
  const errors = [];
  if (!config.credentialId) errors.push('AI Credential is required.');
  const provider = String(config.provider || 'openai').toLowerCase().trim();
  if (provider !== 'openai') errors.push('Unsupported AI provider.');
  if (!config.model) errors.push('AI Model selection is required.');
  if (!config.prompt || !String(config.prompt).trim()) errors.push('Prompt cannot be empty.');

  if (config.temperature !== undefined && config.temperature !== null && config.temperature !== '') {
    const temp = parseFloat(config.temperature);
    if (isNaN(temp) || temp < 0 || temp > 2) {
      errors.push('Temperature must be a number between 0 and 2.');
    }
  }

  if (config.maxTokens !== undefined && config.maxTokens !== null && config.maxTokens !== '') {
    const tokens = parseInt(config.maxTokens, 10);
    if (isNaN(tokens) || tokens < 1) {
      errors.push('Max Tokens must be a positive integer.');
    }
  }

  return { isValid: errors.length === 0, errors };
};

export const aiGenerateTextDefinition = {
  id: AI_NODE_TYPES.GENERATE_TEXT,
  type: AI_NODE_TYPES.GENERATE_TEXT,
  name: 'aiGenerateText',
  label: 'AI → Generate Text',
  displayName: 'AI → Generate Text',
  category: 'AI / Artificial Intelligence',
  description: 'Generate text using an AI model from a user-provided prompt.',
  icon: Sparkles,
  color: 'purple',
  badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  hasInputHandle: true,
  hasOutputHandle: true,
  inputs: ['main'],
  outputs: ['main'],
  defaultConfig: {
    credentialId: '',
    provider: 'openai',
    model: 'gpt-4o-mini',
    prompt: '',
    temperature: 0.7,
    maxTokens: 500,
  },
  validate: aiGenerateTextValidator,
};

export const aiNodeDefinitions = {
  [AI_NODE_TYPES.GENERATE_TEXT]: aiGenerateTextDefinition,
  [AI_NODE_TYPES.AI]: {
    ...aiGenerateTextDefinition,
    id: AI_NODE_TYPES.AI,
    type: AI_NODE_TYPES.AI,
    name: 'ai',
  },
};
