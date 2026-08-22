import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { NodeNotesAction } from './components/NodeNotesAction';

export const DelayNode = memo(({ id, data, selected }) => {
  const config = data?.config || {};

  return (
    <div
      className={`min-w-[220px] rounded-xl bg-white border border-t-[3px] border-t-amber-500 transition-all duration-200 shadow-md ${
        selected
          ? 'border-amber-500 ring-2 ring-amber-500/25 shadow-amber-500/15'
          : 'border-slate-200 hover:border-amber-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-amber-500 !w-3 !h-3 !-left-[7px] border-2 border-white"
      />

      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-lg gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-amber-50 text-amber-600 border-amber-200 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'Delay / Sleep'}
            </h4>
            <span className="text-[9px] font-mono font-bold tracking-tight uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
              ACTION • TIMER
            </span>
          </div>
        </div>

        <NodeNotesAction nodeId={id} note={data?.note} />
      </div>

      <div className="p-3 text-[11px] text-slate-600 bg-slate-50/70 rounded-b-xl">
        Wait for <span className="font-bold text-amber-700 font-mono">{config.seconds || 2}s</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-amber-500 !w-3 !h-3 !-right-[7px] border-2 border-white"
      />
    </div>
  );
});

export default DelayNode;
