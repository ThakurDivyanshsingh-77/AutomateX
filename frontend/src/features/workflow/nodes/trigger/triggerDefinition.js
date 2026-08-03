import { Play } from 'lucide-react';

export const triggerDefinition = {
  type: 'start',
  label: 'Start Trigger',
  category: 'Trigger',
  description: 'Entry point for workflow execution',
  icon: Play,
  color: 'emerald',
  badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  hasInputHandle: false,
  hasOutputHandle: true,
  defaultConfig: {},
  configSchema: [],
  validate: () => ({ isValid: true, errors: {} }),
};
