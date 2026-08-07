import { MessageSquare } from 'lucide-react';

export const DISCORD_NODE_TYPES = {
  SEND_MESSAGE: 'discordSendMessage',
  DISCORD: 'discord',
};

export const discordValidator = (config) => {
  const errors = [];
  if (!config.credentialId) errors.push('Discord Credential is required.');
  if (!config.guildId) errors.push('Discord Server (Guild) selection is required.');
  if (!config.channelId) errors.push('Discord Channel selection is required.');
  if (!config.content && !config.embeds) errors.push('Message content or Embed payload is required.');
  if (config.content && config.content.length > 2000) {
    errors.push(`Message content exceeds 2000 characters limit (${config.content.length}/2000).`);
  }
  return { isValid: errors.length === 0, errors };
};

export const discordSendMessageDefinition = {
  id: DISCORD_NODE_TYPES.SEND_MESSAGE,
  type: DISCORD_NODE_TYPES.SEND_MESSAGE,
  name: 'discordSendMessage',
  label: 'Discord → Send Message',
  displayName: 'Discord → Send Message',
  category: 'Communication',
  description: 'Send text, markdown, mentions, embeds, and TTS messages to a Discord channel',
  icon: MessageSquare,
  color: 'indigo',
  badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  hasInputHandle: true,
  hasOutputHandle: true,
  inputs: ['main'],
  outputs: ['main'],
  defaultConfig: {
    credentialId: '',
    guildId: '',
    channelId: '',
    content: '',
    embeds: '',
    tts: false,
    replyToMessageId: '',
    suppressEmbeds: false,
  },
  validate: discordValidator,
};

export const discordNodeDefinitions = {
  [DISCORD_NODE_TYPES.SEND_MESSAGE]: discordSendMessageDefinition,
  [DISCORD_NODE_TYPES.DISCORD]: {
    ...discordSendMessageDefinition,
    id: DISCORD_NODE_TYPES.DISCORD,
    type: DISCORD_NODE_TYPES.DISCORD,
    name: 'discord',
  },
};
