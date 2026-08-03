export const validateDelayNode = (config = {}) => {
  const errors = {};

  const seconds = Number(config.seconds);
  if (isNaN(seconds) || seconds < 1) {
    errors.seconds = 'Delay duration must be at least 1 second';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
