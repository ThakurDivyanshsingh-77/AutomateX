import React from 'react';
import { ExpressionInput } from '../../../../../components/expression/ExpressionInput';

export const TextField = ({
  label,
  value,
  onChange,
  placeholder,
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
      error={error}
      description={description}
      isTextarea={false}
      workflowNodes={workflowNodes}
      executionSnapshot={executionSnapshot}
    />
  );
};
