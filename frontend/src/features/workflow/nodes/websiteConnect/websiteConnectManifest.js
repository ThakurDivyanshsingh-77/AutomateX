import { Globe } from 'lucide-react';

export const websiteConnectManifest = {
  type: 'websiteConnect',
  category: 'INTEGRATIONS',
  label: 'Website → Connect',
  subtitle: 'Connect AutomateX to a website using API or browser authentication',
  description: 'Connect AutomateX to a website using API or browser authentication.',
  icon: Globe,
  color: 'cyan',
  badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  hasInputHandle: true,
  hasOutputHandle: true,
  defaultConfig: {
    connectionId: '',
    name: '',
    websiteUrl: '',
    apiBaseUrl: '',
    connectionMethod: 'restApi',
    authType: 'bearerToken',
    credentials: {},
    customHeaders: [],
    status: 'untested',
  },
  validate: (config) => {
    const hasConnection = Boolean(config?.connectionId || config?.websiteUrl);
    if (!hasConnection) {
      return {
        isValid: false,
        errors: { website: 'Website URL or Connection ID is required.' },
      };
    }
    return {
      isValid: true,
      errors: {},
    };
  },
};
