import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { SquareCheck } from 'lucide-react';
import { NodeNotesAction } from './components/NodeNotesAction';

export const EndNode = memo(({ id, data, selected }) => {
  return (
    <div
      className={`min-w-[220px] rounded-xl bg-white border transition-all duration-200 shadow-md ${
        selected
          ? 'border-brand-500 ring-2 ring-brand-500/25 shadow-brand-500/15'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-rose-500 !w-3 !h-3 !-left-[7px] border-2 border-white"
      />

      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-rose-50 text-rose-600 border-rose-200">
            <SquareCheck className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'End Completion'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              CONTROL
            </span>
          </div>
        </div>

        <NodeNotesAction nodeId={id} note={data?.note} />
      </div>

      <div className="p-3 text-[11px] text-rose-700 bg-rose-50/50 rounded-b-xl font-mono text-[10px] font-bold">
        Terminal Execution Node
      </div>
    </div>
  );
});


