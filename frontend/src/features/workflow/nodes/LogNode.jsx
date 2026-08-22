import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Terminal } from 'lucide-react';
import { NodeNotesAction } from './components/NodeNotesAction';

export const LogNode = memo(({ id, data, selected }) => {
  const config = data?.config || {};

  return (
    <div
      className={`min-w-[240px] max-w-[300px] rounded-xl bg-white border border-t-[3px] border-t-slate-600 transition-all duration-200 shadow-md ${
        selected
          ? 'border-slate-600 ring-2 ring-slate-600/25 shadow-slate-600/15'
          : 'border-slate-200 hover:border-slate-400'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-slate-600 !w-3 !h-3 !-left-[7px] border-2 border-white"
      />

      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-lg gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-slate-100 text-slate-700 border-slate-300 shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'Console Logger'}
            </h4>
            <span className="text-[9px] font-mono font-bold tracking-tight uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-300">
              ACTION • LOG
            </span>
          </div>
        </div>

        <NodeNotesAction nodeId={id} note={data?.note} />
      </div>

      <div className="p-3 text-[11px] text-slate-600 bg-slate-50/70 rounded-b-xl truncate font-mono">
        "{config.message || 'Log message'}"
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-slate-600 !w-3 !h-3 !-right-[7px] border-2 border-white"
      />
    </div>
  );
});

export default LogNode;
