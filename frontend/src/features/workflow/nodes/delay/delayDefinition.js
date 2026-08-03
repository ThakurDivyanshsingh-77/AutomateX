import { Clock } from 'lucide-react';
import { validateDelayNode } from '../validators/delayValidator';

export const delayDefinition = {
  type: 'delay',
  label: 'Delay / Sleep',
  category: 'Utility',
  description: 'Pauses workflow execution for specified time',
  icon: Clock,
  color: 'amber',
  badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  hasInputHandle: true,
  hasOutputHandle: true,
  defaultConfig: {
    seconds: 2,
  },
  configSchema: [
    {
      name: 'seconds',
      label: 'Duration (Seconds)',
      type: 'number',
      min: 1,
      max: 3600,
      description: 'Number of seconds to pause execution',
    },
  ],
  validate: (config) => validateDelayNode(config),
};
