import { Terminal } from 'lucide-react';
import { validateLogNode } from '../validators/logValidator';

export const logDefinition = {
  type: 'log',
  label: 'Console Logger',
  category: 'Utility',
  description: 'Logs message and payload to execution viewer',
  icon: Terminal,
  color: 'cyan',
  badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  hasInputHandle: true,
  hasOutputHandle: true,
  defaultConfig: {
    message: 'Workflow step executed successfully.',
  },
  configSchema: [
    {
      name: 'message',
      label: 'Log Message Template',
      type: 'textarea',
      placeholder: 'Logging output message...',
      rows: 3,
      description: 'Text string or template to log during execution',
    },
  ],
  validate: (config) => validateLogNode(config),
};
