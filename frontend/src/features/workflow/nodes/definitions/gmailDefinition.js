import { Mail } from 'lucide-react';

export const gmailDefinition = {
  type: 'gmail',
  label: 'Gmail',
  description: 'Send emails, read messages, and manage Gmail automation.',
  category: 'Google',
  icon: Mail,
  color: '#EA4335',
  badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
  defaultData: {
    label: 'Gmail (Send Email)',
    config: {
      credential: '',
      operation: 'sendEmail',
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      body: '',
      bodyType: 'plain',
      searchQuery: 'is:unread',
    },
  },
  // configSchema is intentionally minimal — GmailProperties renders a custom panel
  configSchema: [],
  validate: (config) => {
    if (!config) return { isValid: false, errors: { credential: 'Config missing' } };

    const errors = {};

    if (!config.credential) {
      errors.credential = 'Please connect a Gmail account';
    }

    if (config.operation === 'sendEmail' || !config.operation) {
      if (!config.to) errors.to = 'Recipient email is required';
      if (!config.subject) errors.subject = 'Subject is required';
      if (!config.body) errors.body = 'Body is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};
