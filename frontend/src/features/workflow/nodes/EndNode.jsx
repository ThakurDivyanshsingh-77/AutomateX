import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { SquareCheck } from 'lucide-react';
import { NodeNotesAction } from './components/NodeNotesAction';

export const EndNode = memo(({ id, data, selected }) => {
  return (
    <div
      className={`min-w-[220px] rounded-xl bg-white border border-t-[3px] border-t-rose-500 transition-all duration-200 shadow-md ${
        selected
          ? 'border-rose-500 ring-2 ring-rose-500/25 shadow-rose-500/15'
          : 'border-slate-200 hover:border-rose-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-rose-500 !w-3 !h-3 !-left-[7px] border-2 border-white"
      />

      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-lg gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-rose-50 text-rose-600 border-rose-200 shrink-0">
            <SquareCheck className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'End Completion'}
            </h4>
            <span className="text-[9px] font-mono font-bold tracking-tight uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
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

export default EndNode;
