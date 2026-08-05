import React from 'react';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle, Clock, ArrowDown } from 'lucide-react';

export const RetryTimelineInspector = ({ attempts = [], retrySummary }) => {
  if (!attempts || attempts.length === 0) {
    return (
      <div className="p-3 text-[11px] text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800/80">
        No retry attempts recorded for this step.
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <RefreshCw className="w-3 h-3 text-indigo-400" />
          Retry Timeline ({attempts.length} {attempts.length === 1 ? 'Attempt' : 'Attempts'})
        </label>
        {retrySummary?.recovered && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Recovered on Attempt #{attempts.length}
          </span>
        )}
      </div>

      <div className="space-y-2 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {attempts.map((attempt, index) => {
          const isSuccess = attempt.status === 'success' || attempt.status === 'recovered';
          const isTimeout = attempt.status === 'timeout';
          const isLast = index === attempts.length - 1;

          return (
            <div key={index} className="relative pl-8 space-y-1">
              {/* Timeline Node Badge */}
              <div
                className={`absolute left-1 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                  isSuccess
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : isTimeout
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {attempt.attemptNumber}
              </div>

              {/* Card Header */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                    Attempt #{attempt.attemptNumber}
                    {isSuccess ? (
                      <span className="flex items-center text-emerald-400 gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Success
                      </span>
                    ) : isTimeout ? (
                      <span className="flex items-center text-amber-400 gap-1">
                        <AlertTriangle className="w-3 h-3" /> Timed Out
                      </span>
                    ) : (
                      <span className="flex items-center text-rose-400 gap-1">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </span>

                  {attempt.statusCode && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        attempt.statusCode >= 500
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : attempt.statusCode >= 400
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      HTTP {attempt.statusCode}
                    </span>
                  )}
                </div>

                {attempt.error && (
                  <p className="text-[10px] font-mono text-rose-300 bg-rose-950/30 p-1.5 rounded border border-rose-900/40">
                    {attempt.error}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    Duration: {attempt.durationMs || attempt.duration || 0}ms
                  </span>
                  <span>{new Date(attempt.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Retry in delay marker */}
              {!isLast && attempt.delayUsed > 0 && (
                <div className="py-1 flex items-center gap-1.5 text-[10px] font-medium text-indigo-400 pl-1">
                  <ArrowDown className="w-3 h-3" />
                  Retry in {(attempt.delayUsed / 1000).toFixed(1)}s ({attempt.delayUsed}ms)
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
