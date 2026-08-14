import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Repeat, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForEachTournamentNode = memo(({ id, data, selected }) => {
  const config = data?.config || {};
  const status = data?.executionStatus || data?.status;

  return (
    <div
      className={`min-w-[280px] max-w-[340px] rounded-xl border bg-slate-900/95 p-4 shadow-xl backdrop-blur transition-all duration-200 ${
        selected ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="!h-3 !w-3 !rounded-full !border-2 !border-slate-900 !bg-cyan-400"
      />

      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Repeat className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-semibold text-slate-200 truncate">
              {data?.label || 'For Each Tournament'}
            </h3>
            <p className="text-[10px] text-slate-400 truncate">Item-by-Item Iterator</p>
          </div>
        </div>

        {status === 'success' && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Done
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-3 w-3" /> Error
          </span>
        )}
      </div>

      <div className="mt-3 space-y-2 text-[11px]">
        <div className="flex items-center justify-between rounded-lg bg-slate-950/60 px-2.5 py-1.5 border border-slate-800/80">
          <span className="text-slate-400">Exposes Variable</span>
          <code className="text-cyan-400 font-mono text-[10px]">{"{{currentTournament}}"}</code>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-950/60 px-2.5 py-1.5 border border-slate-800/80">
          <span className="text-slate-400">Batch Size</span>
          <span className="font-mono text-slate-300">1</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="!h-3 !w-3 !rounded-full !border-2 !border-slate-900 !bg-cyan-400"
      />
    </div>
  );
});

ForEachTournamentNode.displayName = 'ForEachTournamentNode';
export default ForEachTournamentNode;
