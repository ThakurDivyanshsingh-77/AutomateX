import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateConditionNode } from './validator';
import { CONDITION_OPERATORS } from './conditionSchema';
import { NodeNotesAction } from '../components/NodeNotesAction';

export const ConditionNode = ({ id, data, selected }) => {
  const config = data?.config || {};
  const validation = validateConditionNode(config);

  const leftDisplay = config.left || 'variable';
  const opObj = CONDITION_OPERATORS.find((op) => op.value === config.operator);
  const opDisplay = opObj ? opObj.label.split(' ')[0] : (config.operator || 'equals');
  const rightDisplay = config.right || '';

  return (
    <div
      className={`min-w-[240px] bg-white border border-t-[3px] border-t-violet-500 rounded-2xl p-3.5 shadow-md transition-all font-sans select-none relative ${
        selected
          ? 'border-violet-500 ring-2 ring-violet-500/25 shadow-violet-500/15'
          : 'border-slate-200 hover:border-violet-300'
      }`}
    >
      {/* Input Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-violet-500 !w-3 !h-3 !border-2 !border-white hover:!bg-violet-600 transition-colors"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-violet-50 border border-violet-200 text-violet-600 shrink-0">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              {data.label || 'IF Condition'}
            </h3>
            <span className="text-[9px] font-mono font-bold tracking-tight uppercase px-1.5 py-0.2 rounded bg-violet-50 text-violet-700 border border-violet-200 block">
              LOGIC • BRANCHING
            </span>
          </div>
        </div>

        {/* Validation Badge & Notes Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {!validation.isValid ? (
            <AlertCircle className="w-4 h-4 text-amber-500" title="Incomplete configuration" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <NodeNotesAction nodeId={id} note={data?.note} />
        </div>
      </div>

      {/* Condition Summary Preview */}
      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[10px] space-y-1">
        <div className="flex items-center justify-between gap-1 text-slate-700">
          <span className="text-slate-600 truncate max-w-[90px] font-medium" title={leftDisplay}>
            {leftDisplay}
          </span>
          <span className="text-violet-800 font-bold px-1.5 py-0.5 rounded bg-violet-100 border border-violet-300 text-[9px]">
            {opDisplay}
          </span>
          <span className="text-slate-600 truncate max-w-[90px] font-medium" title={rightDisplay}>
            {rightDisplay || '—'}
          </span>
        </div>
      </div>

      {/* Dual Output Handles: TRUE and FALSE */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col space-y-2 text-[10px] font-bold font-mono">
        {/* TRUE Branch Output */}
        <div className="flex items-center justify-end gap-1.5 text-emerald-700 relative pr-1">
          <span>TRUE</span>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ top: '68%', right: '-14px' }}
            className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-white hover:!bg-emerald-600 transition-colors"
          />
        </div>

        {/* FALSE Branch Output */}
        <div className="flex items-center justify-end gap-1.5 text-rose-700 relative pr-1">
          <span>FALSE</span>
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{ top: '88%', right: '-14px' }}
            className="!bg-rose-500 !w-3 !h-3 !border-2 !border-white hover:!bg-rose-600 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default ConditionNode;
