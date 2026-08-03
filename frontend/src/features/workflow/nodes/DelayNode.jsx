import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';

export const DelayNode = memo(({ data, selected }) => {
  const config = data?.config || {};

  return (
    <div
      className={`min-w-[220px] rounded-xl bg-slate-900 border transition-all duration-200 shadow-xl ${
        selected
          ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-amber-500/10'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-amber-500 !w-3 !h-3 !-left-[7px] border-2 border-slate-900"
      />

      <div className="flex items-center justify-between p-3 border-b border-slate-800/60 bg-slate-900/50 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-amber-500/10 text-amber-400 border-amber-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-slate-200 truncate">
              {data?.label || 'Delay / Sleep'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              ACTION
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 text-[11px] text-slate-300 bg-slate-950/40 rounded-b-xl">
        Wait for <span className="font-semibold text-amber-400 font-mono">{config.seconds || 2}s</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-amber-500 !w-3 !h-3 !-right-[7px] border-2 border-slate-900"
      />
    </div>
  );
});
