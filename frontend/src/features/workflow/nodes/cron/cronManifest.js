import { Clock } from 'lucide-react';
import cronstrue from 'cronstrue';

export const cronManifest = {
  type: 'cron',
  label: 'Cron Schedule',
  description: 'Triggers workflow automatically on a scheduled cron timer.',
  category: 'Trigger',
  icon: Clock,
  color: 'indigo',
  badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  defaultData: {
    label: 'Cron Schedule',
    config: {
      cronExpression: '0 9 * * *',
      timezone: 'UTC',
      enabled: true,
    },
  },
  configSchema: [],
  validate: (config = {}) => {
    const expr = (config.cronExpression || '').trim();
    if (!expr) {
      return { isValid: false, errors: { cronExpression: 'Cron expression is required' } };
    }
    try {
      cronstrue.toString(expr);
      return { isValid: true, errors: {} };
    } catch (e) {
      return { isValid: false, errors: { cronExpression: 'Invalid cron expression syntax' } };
    }
  },
};
