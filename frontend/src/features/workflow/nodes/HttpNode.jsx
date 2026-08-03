import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe, AlertTriangle } from 'lucide-react';

export const HttpNode = memo(({ data, selected }) => {
  const config = data?.config || {};
  const isInvalid = data?.isValid === false;

  return (
    <div
      className={`min-w-[240px] max-w-[300px] rounded-xl bg-slate-900 border transition-all duration-200 shadow-xl ${
        isInvalid
          ? 'border-amber-500/80 ring-2 ring-amber-500/20'
          : selected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-indigo-500 !w-3 !h-3 !-left-[7px] border-2 border-slate-900"
      />

      <div className="flex items-center justify-between p-3 border-b border-slate-800/60 bg-slate-900/50 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-blue-500/10 text-blue-400 border-blue-500/20">
            <Globe className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-slate-200 truncate">
              {data?.label || 'HTTP Request'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              ACTION
            </span>
          </div>
        </div>

        {isInvalid && (
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" title="Configuration incomplete or invalid" />
        )}
      </div>

      <div className="p-3 text-[11px] text-slate-400 bg-slate-950/40 rounded-b-xl space-y-1">
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold uppercase">
            {config.method || 'GET'}
          </span>
          <span className="truncate text-slate-300">
            {config.url || 'https://...'}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-indigo-500 !w-3 !h-3 !-right-[7px] border-2 border-slate-900"
      />
    </div>
  );
});
