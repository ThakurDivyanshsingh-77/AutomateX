import React from 'react';
import { Repeat, Play, AlertOctagon, CheckCircle2, Clock, List } from 'lucide-react';

export const LoopProgressInspector = ({ progress }) => {
  if (!progress || progress.totalItems === undefined) {
    return (
      <div className="p-3 text-[11px] text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
        No active loop iteration progress recorded.
      </div>
    );
  }

  const iterations = progress.iterations || [];

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Repeat className="w-3 h-3 text-cyan-400" />
          Loop Progress ({progress.completed}/{progress.totalItems} Items)
        </label>
        <span className="text-[10px] font-mono font-bold text-cyan-400">{progress.percent}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300"
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-slate-400">Total</div>
          <div className="font-bold text-slate-200 text-xs">{progress.totalItems}</div>
        </div>
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="text-emerald-400">Done</div>
          <div className="font-bold text-emerald-400 text-xs">{progress.completed}</div>
        </div>
        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <div className="text-rose-400">Failed</div>
          <div className="font-bold text-rose-400 text-xs">{progress.failed}</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-slate-400">Remaining</div>
          <div className="font-bold text-slate-300 text-xs">{progress.remaining}</div>
        </div>
      </div>

      {/* Iteration Stream History */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <List className="w-3 h-3 text-indigo-400" />
          Iteration Trace
        </label>

        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {iterations.map((iter, idx) => {
            const isSuccess = iter.status === 'completed';
            return (
              <div
                key={idx}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold">#{iter.iterationIndex + 1}</span>
                  {isSuccess ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <AlertOctagon className="w-3 h-3 text-rose-400" />
                  )}
                  <span className="text-slate-300 truncate max-w-[120px]">
                    {typeof iter.item === 'object' ? JSON.stringify(iter.item) : String(iter.item)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {iter.durationMs}ms
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
