import { SquareCheck } from 'lucide-react';

export const endDefinition = {
  type: 'end',
  label: 'End Completion',
  category: 'Output',
  description: 'Terminal node marking workflow completion',
  icon: SquareCheck,
  color: 'rose',
  badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  hasInputHandle: true,
  hasOutputHandle: false,
  defaultConfig: {},
  configSchema: [],
  validate: () => ({ isValid: true, errors: {} }),
};
