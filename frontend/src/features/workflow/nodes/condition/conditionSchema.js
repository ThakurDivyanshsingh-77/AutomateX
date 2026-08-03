/**
 * Condition (IF) Node Schema & Operators
 */

export const CONDITION_OPERATORS = [
  { value: 'equals', label: 'Equals (=)', requiresRight: true },
  { value: 'notEquals', label: 'Not Equals (!=)', requiresRight: true },
  { value: 'greaterThan', label: 'Greater Than (>)', requiresRight: true },
  { value: 'greaterThanOrEqual', label: 'Greater Than Or Equal (>=)', requiresRight: true },
  { value: 'lessThan', label: 'Less Than (<)', requiresRight: true },
  { value: 'lessThanOrEqual', label: 'Less Than Or Equal (<=)', requiresRight: true },
  { value: 'contains', label: 'Contains', requiresRight: true },
  { value: 'startsWith', label: 'Starts With', requiresRight: true },
  { value: 'endsWith', label: 'Ends With', requiresRight: true },
  { value: 'isEmpty', label: 'Is Empty', requiresRight: false },
  { value: 'isNotEmpty', label: 'Is Not Empty', requiresRight: false },
  { value: 'exists', label: 'Exists', requiresRight: false },
  { value: 'notExists', label: 'Not Exists', requiresRight: false },
];

export const operatorRequiresRight = (opValue) => {
  const found = CONDITION_OPERATORS.find((op) => op.value === opValue);
  return found ? found.requiresRight : true;
};
