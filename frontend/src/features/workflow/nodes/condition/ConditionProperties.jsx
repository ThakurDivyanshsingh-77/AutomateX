import React from 'react';
import { CONDITION_OPERATORS, operatorRequiresRight } from './conditionSchema';
import { validateConditionNode } from './validator';
import { ExpressionInput } from '../../../../components/expression/ExpressionInput';
import { HelpCircle } from 'lucide-react';

export const ConditionProperties = ({ node, onUpdateNodeData }) => {
  const config = node?.data?.config || {};
  const left = config.left || '';
  const operator = config.operator || 'equals';
  const right = config.right || '';

  const validation = validateConditionNode(config);
  const requiresRight = operatorRequiresRight(operator);

  const updateField = (field, value) => {
    const nextConfig = { ...config, [field]: value };
    const nextValidation = validateConditionNode(nextConfig);

    onUpdateNodeData(node.id, {
      config: nextConfig,
      isValid: nextValidation.isValid,
      validationErrors: nextValidation.errors,
    });
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Variable (Left Operand) */}
      <ExpressionInput
        label="Variable / Expression"
        value={left}
        onChange={(val) => updateField('left', val)}
        placeholder="e.g. {{http.data.status}} or count"
        error={validation.errors.left}
        description="Value or variable to evaluate on left side."
        required
      />

      {/* Operator Dropdown */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Operator <span className="text-amber-400">*</span>
        </label>
        <select
          value={operator}
          onChange={(e) => updateField('operator', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer font-mono"
        >
          {CONDITION_OPERATORS.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      {/* Value (Right Operand) — only if operator requires it */}
      {requiresRight && (
        <ExpressionInput
          label="Value to Compare"
          value={right}
          onChange={(val) => updateField('right', val)}
          placeholder="e.g. 200 or active"
          error={validation.errors.right}
          description="Expected value or pattern to compare against."
          required
        />
      )}

      {/* Help Banner */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-500 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Branching Behavior</span>
        </div>
        <p>
          If evaluation is <span className="text-emerald-400 font-bold">TRUE</span>, execution routes to the top green output handle.
        </p>
        <p>
          If evaluation is <span className="text-red-400 font-bold">FALSE</span>, execution routes to the bottom red output handle.
        </p>
      </div>
    </div>
  );
};
