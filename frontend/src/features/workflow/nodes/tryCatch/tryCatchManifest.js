import { ShieldAlert } from 'lucide-react';

export const tryCatchManifest = {
  type: 'tryCatch',
  label: 'Try / Catch Block',
  description: 'Intercepts errors in the Try branch and routes execution into the Catch branch.',
  category: 'Logic',
  icon: ShieldAlert,
  color: 'indigo',
  badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  defaultData: {
    label: 'Try / Catch',
    config: {},
  },
  configSchema: [],
  validate: () => ({ isValid: true, errors: {} }),
};
