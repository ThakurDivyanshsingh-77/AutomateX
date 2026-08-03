import { GitBranch } from 'lucide-react';
import { validateConditionNode } from './validator';

export const conditionManifest = {
  type: 'condition',
  label: 'IF Condition',
  description: 'Route workflow based on boolean logic evaluation.',
  category: 'Logic',
  icon: GitBranch,
  color: 'amber',
  badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  defaultData: {
    label: 'IF Condition',
    config: {
      left: '',
      operator: 'equals',
      right: '',
    },
  },
  configSchema: [],
  validate: validateConditionNode,
};
