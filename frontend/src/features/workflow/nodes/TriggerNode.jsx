import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';
import { NodeNotesAction } from './components/NodeNotesAction';

export const TriggerNode = memo(({ id, data, selected }) => {
  return (
    <div
      className={`min-w-[220px] rounded-xl bg-white border border-t-[3px] border-t-emerald-500 transition-all duration-200 shadow-md ${
        selected
          ? 'border-emerald-500 ring-2 ring-emerald-500/25 shadow-emerald-500/15'
          : 'border-slate-200 hover:border-emerald-300'
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-lg gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200 shrink-0">
            <Play className="w-4 h-4 fill-emerald-600" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'Start Trigger'}
            </h4>
            <span className="text-[9px] font-mono font-bold tracking-tight uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              TRIGGER
            </span>
          </div>
        </div>

        <NodeNotesAction nodeId={id} note={data?.note} />
      </div>

      <div className="p-3 text-[11px] text-emerald-700 bg-emerald-50/40 rounded-b-xl font-mono text-[10px] flex items-center gap-1.5">
        <Play className="w-3 h-3 fill-emerald-600/30 text-emerald-600" /> Workflow Entry Point
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-emerald-500 !w-3 !h-3 !-right-[7px] border-2 border-white"
      />
    </div>
  );
});

export default TriggerNode;
