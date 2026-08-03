export const validateHttpNode = (config = {}) => {
  const errors = {};

  if (!config.url || !config.url.trim()) {
    errors.url = 'URL is required';
  } else if (!/^https?:\/\/.+/i.test(config.url.trim())) {
    errors.url = 'URL must start with http:// or https://';
  }

  if (!config.method) {
    errors.method = 'HTTP method is required';
  }

  if (config.body && typeof config.body === 'string' && config.body.trim()) {
    try {
      JSON.parse(config.body.trim());
    } catch (e) {
      errors.body = 'Request body must be valid JSON';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
