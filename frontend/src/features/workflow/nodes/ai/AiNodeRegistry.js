import { Sparkles } from 'lucide-react';
import { OpenAiIcon } from '../../components/OpenAiIcon';
import { GeminiIcon } from '../../components/GeminiIcon';

export const AI_NODE_TYPES = {
  GENERATE_TEXT: 'aiGenerateText',
  OPENAI_GENERATE_TEXT: 'openaiGenerateText',
  GEMINI_GENERATE_TEXT: 'geminiGenerateText',
  AI: 'ai',
};

export const aiGenerateTextValidator = (config) => {
  const errors = [];
  if (!config.credentialId) errors.push('AI Credential is required.');
  const provider = String(config.provider || 'openai').toLowerCase().trim();
  if (provider !== 'openai' && provider !== 'gemini' && provider !== 'google') {
    errors.push('Unsupported AI provider.');
  }
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

export const openaiGenerateTextValidator = aiGenerateTextValidator;
export const geminiGenerateTextValidator = aiGenerateTextValidator;

export const aiGenerateTextDefinition = {
  id: AI_NODE_TYPES.GENERATE_TEXT,
  type: AI_NODE_TYPES.GENERATE_TEXT,
  name: 'aiGenerateText',
  label: 'AI → Generate Text',
  displayName: 'AI → Generate Text',
  category: 'AI',
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

export const openaiGenerateTextDefinition = {
  id: AI_NODE_TYPES.OPENAI_GENERATE_TEXT,
  type: AI_NODE_TYPES.OPENAI_GENERATE_TEXT,
  name: 'openaiGenerateText',
  label: 'OpenAI → Generate Text',
  displayName: 'OpenAI → Generate Text',
  category: 'AI',
  description: 'Generate text using an OpenAI model from a user-provided prompt.',
  icon: OpenAiIcon,
  color: 'emerald',
  badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
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
  validate: openaiGenerateTextValidator,
};

export const geminiGenerateTextDefinition = {
  id: AI_NODE_TYPES.GEMINI_GENERATE_TEXT,
  type: AI_NODE_TYPES.GEMINI_GENERATE_TEXT,
  name: 'geminiGenerateText',
  label: 'Gemini → Generate Text',
  displayName: 'Gemini → Generate Text',
  category: 'AI',
  description: 'Generate text using a Google Gemini model from a user-provided prompt.',
  icon: GeminiIcon,
  color: 'sky',
  badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  hasInputHandle: true,
  hasOutputHandle: true,
  inputs: ['main'],
  outputs: ['main'],
  defaultConfig: {
    credentialId: '',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    prompt: '',
    temperature: 0.7,
    maxTokens: 500,
  },
  validate: geminiGenerateTextValidator,
};

export const aiNodeDefinitions = {
  [AI_NODE_TYPES.GENERATE_TEXT]: aiGenerateTextDefinition,
  [AI_NODE_TYPES.OPENAI_GENERATE_TEXT]: openaiGenerateTextDefinition,
  [AI_NODE_TYPES.GEMINI_GENERATE_TEXT]: geminiGenerateTextDefinition,
  [AI_NODE_TYPES.AI]: {
    ...aiGenerateTextDefinition,
    id: AI_NODE_TYPES.AI,
    type: AI_NODE_TYPES.AI,
    name: 'ai',
  },
};
