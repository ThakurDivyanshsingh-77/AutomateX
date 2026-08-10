import { MessageSquare, Layout, FolderPlus, Trash2, ShieldPlus, ShieldX } from 'lucide-react';

export const DISCORD_NODE_TYPES = {
  SEND_MESSAGE: 'discordSendMessage',
  SEND_EMBED: 'discordSendEmbed',
  CREATE_CHANNEL: 'discordCreateChannel',
  DELETE_CHANNEL: 'discordDeleteChannel',
  CREATE_ROLE: 'discordCreateRole',
  DELETE_ROLE: 'discordDeleteRole',
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

export const discordCreateChannelValidator = (config) => {
  const errors = [];
  if (!config.credentialId) errors.push('Discord Credential is required.');
  if (!config.guildId) errors.push('Discord Server (Guild) selection is required.');
  const trimmedName = (config.name || config.channelName || '').trim();
  if (!trimmedName) {
    errors.push('Channel Name is required.');
  } else if (trimmedName.length > 100) {
    errors.push(`Channel Name exceeds 100 characters limit (${trimmedName.length}/100).`);
  }
  return { isValid: errors.length === 0, errors };
};

export const discordDeleteChannelValidator = (config) => {
  const errors = [];
  if (!config.credentialId) errors.push('Discord Credential is required.');
  const targetChannelId = (config.channelId || config.channel || '').trim();
  if (!targetChannelId) {
    errors.push('Discord Channel selection or dynamic Channel ID expression is required.');
  }
  const isConfirmed = Boolean(config.confirmDelete === true || config.confirmDelete === 'true');
  if (!isConfirmed) {
    errors.push('Confirmation is required to delete a Discord channel permanently.');
  }
  return { isValid: errors.length === 0, errors };
};

export const discordCreateRoleValidator = (config) => {
  const errors = [];
  if (!config.credentialId) errors.push('Discord Credential is required.');
  if (!config.guildId) errors.push('Discord Server (Guild) selection is required.');
  const trimmedName = (config.name || config.roleName || '').trim();
  if (!trimmedName) {
    errors.push('Role Name is required.');
  } else if (trimmedName.length > 100) {
    errors.push(`Role Name exceeds 100 characters limit (${trimmedName.length}/100).`);
  }
  return { isValid: errors.length === 0, errors };
};

export const discordDeleteRoleValidator = (config) => {
  const errors = [];
  if (!config.credentialId) errors.push('Discord Credential is required.');
  const targetRoleId = (config.roleId || config.role || config.id || '').trim();
  if (!targetRoleId) {
    errors.push('Discord Role selection or dynamic Role ID expression is required.');
  }
  const targetGuildId = (config.guildId || config.guild || '').trim();
  const targetRoleName = (config.roleName || config.name || '').trim();

  if (
    (targetGuildId && targetRoleId && targetRoleId === targetGuildId) ||
    targetRoleId.toLowerCase() === '@everyone' ||
    targetRoleName.toLowerCase() === '@everyone'
  ) {
    errors.push('The @everyone role cannot be deleted.');
  }

  const isConfirmed = Boolean(config.confirmDelete === true || config.confirmDelete === 'true');
  if (!isConfirmed) {
    errors.push('Confirmation is required to delete a Discord role permanently.');
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

export const discordCreateChannelDefinition = {
  id: DISCORD_NODE_TYPES.CREATE_CHANNEL,
  type: DISCORD_NODE_TYPES.CREATE_CHANNEL,
  name: 'discordCreateChannel',
  label: 'Discord → Create Channel',
  displayName: 'Discord → Create Channel',
  category: 'Communication',
  description: 'Create a new Text Channel, Voice Channel, or Category in a Discord Server.',
  icon: FolderPlus,
  color: 'indigo',
  badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  hasInputHandle: true,
  hasOutputHandle: true,
  inputs: ['main'],
  outputs: ['main'],
  defaultConfig: {
    credentialId: '',
    guildId: '',
    channelType: 0,
    name: '',
    topic: '',
    nsfw: false,
    slowmode: 0,
    parentId: '',
    bitrate: 64000,
    userLimit: 0,
  },
  validate: discordCreateChannelValidator,
};

export const discordDeleteChannelDefinition = {
  id: DISCORD_NODE_TYPES.DELETE_CHANNEL,
  type: DISCORD_NODE_TYPES.DELETE_CHANNEL,
  name: 'discordDeleteChannel',
  label: 'Discord → Delete Channel',
  displayName: 'Discord → Delete Channel',
  category: 'Communication',
  description: 'Delete an existing Discord channel using the Discord Bot Token.',
  icon: Trash2,
  color: 'rose',
  badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  hasInputHandle: true,
  hasOutputHandle: true,
  inputs: ['main'],
  outputs: ['main'],
  defaultConfig: {
    credentialId: '',
    guildId: '',
    channelId: '',
    confirmDelete: false,
  },
  validate: discordDeleteChannelValidator,
};

export const discordCreateRoleDefinition = {
  id: DISCORD_NODE_TYPES.CREATE_ROLE,
  type: DISCORD_NODE_TYPES.CREATE_ROLE,
  name: 'discordCreateRole',
  label: 'Discord → Create Role',
  displayName: 'Discord → Create Role',
  category: 'Communication',
  description: 'Create a new Discord role with custom color, hoist, mentionable permissions, and audit log reason.',
  icon: ShieldPlus,
  color: 'indigo',
  badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  hasInputHandle: true,
  hasOutputHandle: true,
  inputs: ['main'],
  outputs: ['main'],
  defaultConfig: {
    credentialId: '',
    guildId: '',
    name: '',
    color: '#5865F2',
    hoist: false,
    mentionable: false,
    reason: '',
  },
  validate: discordCreateRoleValidator,
};

export const discordDeleteRoleDefinition = {
  id: DISCORD_NODE_TYPES.DELETE_ROLE,
  type: DISCORD_NODE_TYPES.DELETE_ROLE,
  name: 'discordDeleteRole',
  label: 'Discord → Delete Role',
  displayName: 'Discord → Delete Role',
  category: 'Communication',
  description: 'Delete an existing Discord role from a selected Discord server.',
  icon: ShieldX,
  color: 'rose',
  badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  hasInputHandle: true,
  hasOutputHandle: true,
  inputs: ['main'],
  outputs: ['main'],
  defaultConfig: {
    credentialId: '',
    guildId: '',
    roleId: '',
    reason: '',
    confirmDelete: false,
  },
  validate: discordDeleteRoleValidator,
};

export const discordNodeDefinitions = {
  [DISCORD_NODE_TYPES.SEND_MESSAGE]: discordSendMessageDefinition,
  [DISCORD_NODE_TYPES.SEND_EMBED]: discordSendEmbedDefinition,
  [DISCORD_NODE_TYPES.CREATE_CHANNEL]: discordCreateChannelDefinition,
  [DISCORD_NODE_TYPES.DELETE_CHANNEL]: discordDeleteChannelDefinition,
  [DISCORD_NODE_TYPES.CREATE_ROLE]: discordCreateRoleDefinition,
  [DISCORD_NODE_TYPES.DELETE_ROLE]: discordDeleteRoleDefinition,
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




