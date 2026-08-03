import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateConditionNode } from './validator';
import { CONDITION_OPERATORS } from './conditionSchema';

export const ConditionNode = ({ data, selected }) => {
  const config = data?.config || {};
  const validation = validateConditionNode(config);

  const leftDisplay = config.left || 'variable';
  const opObj = CONDITION_OPERATORS.find((op) => op.value === config.operator);
  const opDisplay = opObj ? opObj.label.split(' ')[0] : (config.operator || 'equals');
  const rightDisplay = config.right || '';

  return (
    <div
      className={`min-w-[240px] bg-slate-900 border rounded-2xl p-3.5 shadow-2xl transition-all font-sans select-none relative ${
        selected
          ? 'border-amber-500 ring-2 ring-amber-500/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Input Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-slate-700 !w-3 !h-3 !border-2 !border-slate-900 hover:!bg-amber-500 transition-colors"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight">
              {data.label || 'IF Condition'}
            </h3>
            <span className="text-[10px] font-mono text-amber-400/80 capitalize block">
              Logic / Branching
            </span>
          </div>
        </div>

        {/* Validation Badge */}
        {!validation.isValid ? (
          <AlertCircle className="w-4 h-4 text-amber-400" title="Incomplete configuration" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        )}
      </div>

      {/* Condition Summary Preview */}
      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[10px] space-y-1">
        <div className="flex items-center justify-between gap-1 text-slate-300">
          <span className="text-slate-400 truncate max-w-[90px]" title={leftDisplay}>
            {leftDisplay}
          </span>
          <span className="text-amber-400 font-bold px-1 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px]">
            {opDisplay}
          </span>
          <span className="text-slate-300 truncate max-w-[90px]" title={rightDisplay}>
            {rightDisplay || '—'}
          </span>
        </div>
      </div>

      {/* Dual Output Handles: TRUE and FALSE */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex flex-col space-y-2 text-[10px] font-bold font-mono">
        {/* TRUE Branch Output */}
        <div className="flex items-center justify-end gap-1.5 text-emerald-400 relative pr-1">
          <span>TRUE</span>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ top: '68%', right: '-14px' }}
            className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-slate-900 hover:!bg-emerald-400 transition-colors"
          />
        </div>

        {/* FALSE Branch Output */}
        <div className="flex items-center justify-end gap-1.5 text-rose-400 relative pr-1">
          <span>FALSE</span>
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{ top: '88%', right: '-14px' }}
            className="!bg-rose-500 !w-3 !h-3 !border-2 !border-slate-900 hover:!bg-rose-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
