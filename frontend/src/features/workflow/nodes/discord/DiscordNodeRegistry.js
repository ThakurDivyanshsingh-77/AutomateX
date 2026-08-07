import { MessageSquare, Layout } from 'lucide-react';

export const DISCORD_NODE_TYPES = {
  SEND_MESSAGE: 'discordSendMessage',
  SEND_EMBED: 'discordSendEmbed',
  DISCORD_EMBED: 'discordEmbed',
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

export const discordEmbedValidator = (config) => {
  const errors = [];
  if (!config.credentialId) errors.push('Discord Credential is required.');
  if (!config.guildId) errors.push('Discord Server (Guild) selection is required.');
  if (!config.channelId) errors.push('Discord Channel selection is required.');

  const hasContent = Boolean(
    config.title ||
    config.description ||
    config.authorName ||
    config.footerText ||
    config.imageUrl ||
    config.thumbnailUrl ||
    (Array.isArray(config.fields) && config.fields.length > 0)
  );

  if (!hasContent) {
    errors.push('Embed must contain at least Title, Description, Author, Footer, Media, or Fields.');
  }

  if (config.title && config.title.length > 256) {
    errors.push(`Title exceeds 256 characters (${config.title.length}/256).`);
  }
  if (config.description && config.description.length > 4096) {
    errors.push(`Description exceeds 4096 characters (${config.description.length}/4096).`);
  }
  if (config.fields && config.fields.length > 25) {
    errors.push(`Maximum 25 fields allowed (${config.fields.length}/25).`);
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

export const discordSendEmbedDefinition = {
  id: DISCORD_NODE_TYPES.SEND_EMBED,
  type: DISCORD_NODE_TYPES.SEND_EMBED,
  name: 'discordSendEmbed',
  label: 'Discord → Send Embed',
  displayName: 'Discord → Send Embed',
  category: 'Communication',
  description: 'Send a rich Discord Embed card with title, description, author, fields, media, and live preview',
  icon: Layout,
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
    title: 'AutomateX Notification',
    description: 'Workflow step executed successfully!',
    color: '#5865F2',
    url: '',
    authorName: '',
    authorUrl: '',
    authorIconUrl: '',
    thumbnailUrl: '',
    imageUrl: '',
    footerText: 'AutomateX Workflow Engine',
    footerIconUrl: '',
    timestamp: true,
    fields: [],
  },
  validate: discordEmbedValidator,
};

export const discordNodeDefinitions = {
  [DISCORD_NODE_TYPES.SEND_MESSAGE]: discordSendMessageDefinition,
  [DISCORD_NODE_TYPES.SEND_EMBED]: discordSendEmbedDefinition,
  [DISCORD_NODE_TYPES.DISCORD_EMBED]: {
    ...discordSendEmbedDefinition,
    id: DISCORD_NODE_TYPES.DISCORD_EMBED,
    type: DISCORD_NODE_TYPES.DISCORD_EMBED,
    name: 'discordEmbed',
  },
  [DISCORD_NODE_TYPES.DISCORD]: {
    ...discordSendMessageDefinition,
    id: DISCORD_NODE_TYPES.DISCORD,
    type: DISCORD_NODE_TYPES.DISCORD,
    name: 'discord',
  },
};
