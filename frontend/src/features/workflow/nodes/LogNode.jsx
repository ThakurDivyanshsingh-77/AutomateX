import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Terminal } from 'lucide-react';

export const LogNode = memo(({ data, selected }) => {
  const config = data?.config || {};

  return (
    <div
      className={`min-w-[240px] max-w-[300px] rounded-xl bg-white border transition-all duration-200 shadow-md ${
        selected
          ? 'border-brand-500 ring-2 ring-brand-500/25 shadow-brand-500/15'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-cyan-500 !w-3 !h-3 !-left-[7px] border-2 border-white"
      />

      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-cyan-50 text-cyan-600 border-cyan-200">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'Console Logger'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              ACTION
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 text-[11px] text-slate-600 bg-slate-50/70 rounded-b-xl truncate font-mono">
        "{config.message || 'Log message'}"
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-cyan-500 !w-3 !h-3 !-right-[7px] border-2 border-white"
      />
    </div>
  );
});

