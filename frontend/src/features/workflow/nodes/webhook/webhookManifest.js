import { Webhook } from 'lucide-react';

export const webhookManifest = {
  type: 'webhook',
  label: 'Webhook Trigger',
  description: 'Starts workflow when an external HTTP request is received.',
  category: 'Trigger',
  icon: Webhook,
  color: 'blue',
  badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  defaultData: {
    label: 'Webhook Trigger',
    config: {
      path: 'user-signup',
      method: 'ANY',
      authType: 'none',
      authSecret: '',
      headerName: 'x-webhook-secret',
    },
  },
  configSchema: [],
  validate: (config) => {
    return { isValid: true, errors: {} };
  },
};
