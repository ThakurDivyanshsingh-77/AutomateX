export const gmailValidator = (config = {}) => {
  const errors = [];

  if (!config.to || !config.to.trim()) {
    errors.push('Recipient email address (To) is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.to.trim())) {
      errors.push('Invalid email address format in "To" field');
    }
  }

  if (!config.subject || !config.subject.trim()) {
    errors.push('Email subject line is required');
  }

  if (!config.body || !config.body.trim()) {
    errors.push('Email body content is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
