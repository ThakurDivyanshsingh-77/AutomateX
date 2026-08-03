import React from 'react';
import { CheckCircle2, XCircle, Clock, SkipForward, Play, Activity } from 'lucide-react';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    case 'failed':
      return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
    case 'running':
      return <Activity className="w-3.5 h-3.5 text-amber-400 animate-spin" />;
    default:
      return <SkipForward className="w-3.5 h-3.5 text-slate-500" />;
  }
};

export const ExecutionTimeline = ({ timeline = [], selectedStepIndex, onSelectStep }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-4 text-[11px] text-slate-500 italic text-center font-mono">
        No execution step timeline logs available.
      </div>
    );
  }

  return (
    <div className="space-y-1.5 p-2 font-sans select-none">
      <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
        Execution Timeline ({timeline.length} Steps)
      </h4>

      <div className="space-y-1.5">
        {timeline.map((step) => {
          const isSelected = selectedStepIndex === step.stepIndex;

          return (
            <button
              key={step.stepIndex}
              type="button"
              onClick={() => onSelectStep(step.stepIndex)}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-200 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <StatusBadge status={step.status} />
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      #{step.stepIndex}
                    </span>
                    <h5 className="text-xs font-bold text-slate-200 truncate">
                      {step.nodeName || step.nodeType}
                    </h5>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">
                    {step.nodeType}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 flex-shrink-0">
                <Clock className="w-3 h-3 text-slate-600" />
                <span>{step.durationMs}ms</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
