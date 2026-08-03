export const validateLogNode = (config = {}) => {
  const errors = {};

  if (!config.message || !config.message.trim()) {
    errors.message = 'Log message is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
