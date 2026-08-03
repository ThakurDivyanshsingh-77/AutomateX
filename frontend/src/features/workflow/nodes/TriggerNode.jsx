import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export const TriggerNode = memo(({ data, selected }) => {
  return (
    <div
      className={`min-w-[220px] rounded-xl bg-slate-900 border transition-all duration-200 shadow-xl ${
        selected
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-slate-800/60 bg-slate-900/50 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <Play className="w-4 h-4 fill-emerald-400" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-slate-200 truncate">
              {data?.label || 'Start Trigger'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              TRIGGER
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 text-[11px] text-slate-400 bg-slate-950/40 rounded-b-xl font-mono text-[10px] text-emerald-400 flex items-center gap-1">
        <Play className="w-3 h-3 fill-emerald-400/20" /> Workflow Entry Point
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-emerald-500 !w-3 !h-3 !-right-[7px] border-2 border-slate-900"
      />
    </div>
  );
});
