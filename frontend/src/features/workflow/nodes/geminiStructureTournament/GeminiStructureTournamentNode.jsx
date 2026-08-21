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
      className={`min-w-[280px] max-w-[340px] rounded-xl border bg-white p-4 shadow-md transition-all duration-200 ${
        selected ? 'border-brand-500 ring-2 ring-brand-500/25 shadow-brand-500/15' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Target handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-amber-500"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                {data?.label || 'Gemini → Structure Tournament'}
              </h3>
              <Sparkles className="h-3 w-3 text-amber-500" />
            </div>
            <p className="text-[10px] text-slate-500 font-mono truncate">{model}</p>
          </div>
        </div>

        {status === 'success' && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Ready
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
            <AlertCircle className="h-3 w-3" /> Error
          </span>
        )}
      </div>

      {/* Body */}
      <div className="mt-3 space-y-2 text-[11px]">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 border border-slate-200">
          <span className="text-slate-600">Strict Zero-Hallucination</span>
          <span className="font-bold text-emerald-700">Enforced</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 border border-slate-200">
          <span className="text-slate-600">Temperature</span>
          <span className="font-mono text-slate-800 font-bold">{temperature}</span>
        </div>
      </div>

      {/* Source handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-amber-500"
      />
    </div>
  );
});

GeminiStructureTournamentNode.displayName = 'GeminiStructureTournamentNode';
export default GeminiStructureTournamentNode;

