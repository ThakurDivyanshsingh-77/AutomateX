import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Clock, Terminal, Activity } from 'lucide-react';
import { ExecutionDebugger } from '../../../components/debugger/ExecutionDebugger';

export const ExecutionLogsDrawer = ({ execution, onClose }) => {
  const [isDebuggerOpen, setIsDebuggerOpen] = useState(false);

  if (!execution) return null;

  const logs = execution.logs || [];
  const isSuccess = execution.status === 'success';
  const execId = execution._id || execution.executionId;

  return (
    <>
      <aside className="fixed inset-y-0 right-0 w-[420px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-50 font-sans select-none">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400" />
            )}
            <div>
              <h3 className="text-xs font-bold text-white tracking-tight">
                Execution Run Details
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                ID: {execId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsDebuggerOpen(true)}
              className="p-1 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-sm"
            >
              <Activity className="w-3 h-3" /> Inspect Debugger
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="p-3.5 bg-slate-900/60 border-b border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Status</span>
            <span className={`font-mono font-bold capitalize ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
              {execution.status}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Duration</span>
            <span className="font-mono font-bold text-white">
              {execution.duration || 0}ms
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Steps</span>
            <span className="font-mono font-bold text-indigo-400">
              {execution.nodesExecuted || logs.length}
            </span>
          </div>
        </div>

        {/* Step Logs List */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Step-by-Step Execution Logs
          </h4>

          {logs.length === 0 ? (
            <p className="text-[11px] text-slate-500 font-mono italic">No step logs recorded.</p>
          ) : (
            logs.map((log, idx) => {
              const stepSuccess = log.status === 'success';
              return (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {stepSuccess ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      )}
                      <span className="font-bold text-slate-200 text-xs">
                        {log.nodeName || log.nodeType}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {log.duration}ms
                    </span>
                  </div>

                  {log.error && (
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                      ⚠️ {log.error.message || String(log.error)}
                    </div>
                  )}

                  {log.output && Object.keys(log.output).length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-slate-500 uppercase">Step Output Payload</span>
                      <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-indigo-300 overflow-x-auto max-h-36">
                        {JSON.stringify(log.output, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Execution Debugger Modal */}
      <ExecutionDebugger
        isOpen={isDebuggerOpen}
        onClose={() => setIsDebuggerOpen(false)}
        executionId={execId}
      />
    </>
  );
};
