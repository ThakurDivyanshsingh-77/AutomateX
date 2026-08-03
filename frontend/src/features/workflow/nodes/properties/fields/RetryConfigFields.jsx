import React, { useState } from 'react';
import { RotateCcw, ChevronDown, ChevronUp, ShieldAlert, AlertTriangle } from 'lucide-react';

export const RetryConfigFields = ({ config = {}, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const retryCount = config.retryCount !== undefined ? config.retryCount : 0;
  const retryDelay = config.retryDelay !== undefined ? config.retryDelay : 1000;
  const retryStrategy = config.retryStrategy || 'fixed';
  const continueOnError = Boolean(config.continueOnError);
  const timeoutMs = config.timeoutMs !== undefined ? config.timeoutMs : 0;

  return (
    <div className="border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden text-xs font-sans">
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 px-3 bg-slate-900/80 hover:bg-slate-800/80 flex items-center justify-between transition-colors text-slate-300 font-semibold"
      >
        <div className="flex items-center gap-2 text-xs">
          <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Error Handling & Retry Policy</span>
          {retryCount > 0 && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
              {retryCount} Retries ({retryStrategy})
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-3.5 space-y-3.5 border-t border-slate-800/80 bg-slate-950">
          {/* Retry Count & Delay */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Retry Attempts
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={retryCount}
                onChange={(e) => onChange('retryCount', parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Base Delay (ms)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={retryDelay}
                onChange={(e) => onChange('retryDelay', parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Retry Strategy & Timeout */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Backoff Strategy
              </label>
              <select
                value={retryStrategy}
                onChange={(e) => onChange('retryStrategy', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="fixed">Fixed Delay</option>
                <option value="immediate">Immediate</option>
                <option value="exponential">Exponential</option>
                <option value="linear">Linear</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Timeout (ms)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="0 = Disabled"
                value={timeoutMs}
                onChange={(e) => onChange('timeoutMs', parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Continue On Error */}
          <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={continueOnError}
              onChange={(e) => onChange('continueOnError', e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
            />
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Continue Workflow On Error</span>
              <span className="text-[10px] text-slate-500 block leading-tight">
                If checked, workflow execution proceeds even if all retries fail.
              </span>
            </div>
          </label>
        </div>
      )}
    </div>
  );
};
