import { operatorRequiresRight } from './conditionSchema';

/**
 * Client-side Validator for Condition (IF) Node Configuration
 * @param {object} config - { left, operator, right }
 * @returns {{ isValid: boolean, errors: object }}
 */
export const validateConditionNode = (config = {}) => {
  const errors = {};

  const left = config.left !== undefined && config.left !== null ? String(config.left).trim() : '';
  const operator = config.operator || 'equals';
  const right = config.right !== undefined && config.right !== null ? String(config.right).trim() : '';

  if (!left) {
    errors.left = 'Variable / Left operand is required';
  }

  if (!operator) {
    errors.operator = 'Operator is required';
  }

  if (operatorRequiresRight(operator) && !right) {
    errors.right = 'Value / Right operand is required for this operator';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
