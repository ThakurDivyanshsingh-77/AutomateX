import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Trophy, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const GeminiStructureTournamentNode = memo(({ id, data, selected }) => {
  const config = data?.config || {};
  const status = data?.executionStatus || data?.status;
  const model = config.model || 'gemini-1.5-pro';
  const temperature = typeof config.temperature === 'number' ? config.temperature : 0.0;

  return (
    <div
      className={`min-w-[280px] max-w-[340px] rounded-xl border bg-slate-900/95 p-4 shadow-xl backdrop-blur transition-all duration-200 ${
        selected ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Target handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="!h-3 !w-3 !rounded-full !border-2 !border-slate-900 !bg-amber-400"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-semibold text-slate-200 truncate">
                {data?.label || 'Gemini → Structure Tournament'}
              </h3>
              <Sparkles className="h-3 w-3 text-amber-400" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate">{model}</p>
          </div>
        </div>

        {status === 'success' && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Ready
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-3 w-3" /> Error
          </span>
        )}
      </div>

      {/* Body */}
      <div className="mt-3 space-y-2 text-[11px]">
        <div className="flex items-center justify-between rounded-lg bg-slate-950/60 px-2.5 py-1.5 border border-slate-800/80">
          <span className="text-slate-400">Strict Zero-Hallucination</span>
          <span className="font-semibold text-emerald-400">Enforced</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-950/60 px-2.5 py-1.5 border border-slate-800/80">
          <span className="text-slate-400">Temperature</span>
          <span className="font-mono text-slate-300">{temperature}</span>
        </div>
      </div>

      {/* Source handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="!h-3 !w-3 !rounded-full !border-2 !border-slate-900 !bg-amber-400"
      />
    </div>
  );
});

GeminiStructureTournamentNode.displayName = 'GeminiStructureTournamentNode';
export default GeminiStructureTournamentNode;
