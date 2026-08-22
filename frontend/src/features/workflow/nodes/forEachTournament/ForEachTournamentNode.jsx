import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Repeat, CheckCircle2, AlertCircle } from 'lucide-react';
import { NodeNotesAction } from '../components/NodeNotesAction';

export const ForEachTournamentNode = memo(({ id, data, selected }) => {
  const config = data?.config || {};
  const status = data?.executionStatus || data?.status;

  return (
    <div
      className={`min-w-[280px] max-w-[340px] rounded-xl border border-t-[3px] border-t-cyan-500 bg-white p-4 shadow-md transition-all duration-200 ${
        selected ? 'border-cyan-500 ring-2 ring-cyan-500/25 shadow-cyan-500/15' : 'border-slate-200 hover:border-cyan-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-cyan-500"
      />

      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200 shrink-0">
            <Repeat className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'For Each Tournament'}
            </h3>
            <span className="text-[9px] font-mono font-bold tracking-tight uppercase px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 block">
              LOOP • ITERATOR
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {status === 'success' && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-3 w-3" /> Done
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
              <AlertCircle className="h-3 w-3" /> Error
            </span>
          )}
          <NodeNotesAction nodeId={id} note={data?.note} />
        </div>
      </div>

      <div className="mt-3 space-y-2 text-[11px]">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 border border-slate-200">
          <span className="text-slate-600">Exposes Variable</span>
          <code className="text-cyan-700 font-mono text-[10px] font-bold">{"{{currentTournament}}"}</code>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 border border-slate-200">
          <span className="text-slate-600">Batch Size</span>
          <span className="font-mono text-slate-800 font-bold">1</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-cyan-500"
      />
    </div>
  );
});

ForEachTournamentNode.displayName = 'ForEachTournamentNode';
export default ForEachTournamentNode;
