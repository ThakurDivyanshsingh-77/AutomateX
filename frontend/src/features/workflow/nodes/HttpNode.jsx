import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe, AlertTriangle } from 'lucide-react';
import { NodeNotesAction } from './components/NodeNotesAction';

export const HttpNode = memo(({ id, data, selected }) => {
  const config = data?.config || {};
  const isInvalid = data?.isValid === false;

  return (
    <div
      className={`min-w-[240px] max-w-[300px] rounded-xl bg-white border border-t-[3px] border-t-teal-500 transition-all duration-200 shadow-md ${
        isInvalid
          ? 'border-amber-400 ring-2 ring-amber-400/30'
          : selected
          ? 'border-teal-500 ring-2 ring-teal-500/25 shadow-teal-500/15'
          : 'border-slate-200 hover:border-teal-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-teal-500 !w-3 !h-3 !-left-[7px] border-2 border-white"
      />

      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-lg gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-teal-50 text-teal-600 border-teal-200 shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'HTTP Request'}
            </h4>
            <span className="text-[9px] font-mono font-bold tracking-tight uppercase px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200">
              ACTION • REST
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {isInvalid && (
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" title="Configuration incomplete or invalid" />
          )}
          <NodeNotesAction nodeId={id} note={data?.note} />
        </div>
      </div>

      <div className="p-3 text-[11px] text-slate-600 bg-slate-50/70 rounded-b-xl space-y-1">
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-bold uppercase">
            {config.method || 'GET'}
          </span>
          <span className="truncate text-slate-700 font-medium">
            {config.url || 'https://...'}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-teal-500 !w-3 !h-3 !-right-[7px] border-2 border-white"
      />
    </div>
  );
});

export default HttpNode;
