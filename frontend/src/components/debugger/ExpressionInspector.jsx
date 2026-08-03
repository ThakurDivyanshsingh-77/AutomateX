import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export const ExpressionInspector = ({ expressions = [] }) => {
  if (!expressions || expressions.length === 0) {
    return (
      <div className="p-4 text-[11px] text-slate-500 italic text-center font-mono bg-slate-950 rounded-xl border border-slate-800">
        No template expressions evaluated in this step.
      </div>
    );
  }

  return (
    <div className="space-y-2 font-sans">
      <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        Resolved Expressions ({expressions.length})
      </h4>

      <div className="space-y-2">
        {expressions.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-950 border border-purple-500/20 font-mono text-xs space-y-1.5"
          >
            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
              Field: {item.field}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[11px]">
              <div className="p-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 text-purple-300 font-medium truncate flex-1">
                <span className="text-[9px] text-slate-500 block uppercase font-mono">Original:</span>
                <code>{item.original}</code>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-600 self-center hidden sm:block flex-shrink-0" />

              <div className="p-1.5 px-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-emerald-300 font-bold truncate flex-1">
                <span className="text-[9px] text-purple-400 block uppercase font-mono">Resolved Output:</span>
                <code>{typeof item.resolved === 'object' ? JSON.stringify(item.resolved) : String(item.resolved)}</code>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
