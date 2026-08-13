import React from 'react';
import { ExpressionInput } from '../../../../../components/expression/ExpressionInput';

export const TextareaField = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
  description,
  workflowNodes,
  executionSnapshot,
}) => {
  return (
    <ExpressionInput
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      error={error}
      description={description}
      isTextarea={true}
      workflowNodes={workflowNodes}
      executionSnapshot={executionSnapshot}
    />
  );
};
