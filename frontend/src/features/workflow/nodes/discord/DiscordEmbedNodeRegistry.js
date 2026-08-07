import { Layout } from 'lucide-react';

export const discordSendEmbedNode = {
  id: 'discordSendEmbed',
  type: 'discordSendEmbed',
  name: 'Discord → Send Embed',
  displayName: 'Discord → Send Embed',
  category: 'Communication',
  description: 'Send a rich Discord Embed card with title, description, author, fields, thumbnail, image, and custom color accent.',
  icon: Layout,
  color: 'indigo',
  inputs: [
    { id: 'input', label: 'Trigger Input', type: 'main' },
  ],
  outputs: [
    { id: 'output', label: 'Embed Result Payload', type: 'main' },
  ],
  defaultData: {
    label: 'Discord → Send Embed',
    config: {
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
  },
};
