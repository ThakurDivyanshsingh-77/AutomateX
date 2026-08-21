import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export const TriggerNode = memo(({ data, selected }) => {
  return (
    <div
      className={`min-w-[220px] rounded-xl bg-white border transition-all duration-200 shadow-md ${
        selected
          ? 'border-brand-500 ring-2 ring-brand-500/25 shadow-brand-500/15'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200">
            <Play className="w-4 h-4 fill-emerald-600" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'Start Trigger'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              TRIGGER
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 text-[11px] text-emerald-700 bg-emerald-50/40 rounded-b-xl font-mono text-[10px] flex items-center gap-1">
        <Play className="w-3 h-3 fill-emerald-600/30 text-emerald-600" /> Workflow Entry Point
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-brand-500 !w-3 !h-3 !-right-[7px] border-2 border-white"
      />
    </div>
  );
});

