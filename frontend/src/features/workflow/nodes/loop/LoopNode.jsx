import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Repeat, Zap, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';

export const LoopNode = ({ data, selected }) => {
  const config = data.config || {};
  const progress = data.progress || { totalItems: 0, completed: 0, failed: 0, percent: 0 };
  const mode = config.mode || 'sequential';
  const concurrency = config.concurrency || 5;
  const isParallel = mode === 'parallel';

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress.percent / 100) * circumference;

  return (
    <div
      className={`w-64 rounded-2xl bg-slate-900 border-2 transition-all shadow-xl font-sans ${
        selected ? 'border-cyan-400 ring-4 ring-cyan-500/20' : 'border-cyan-500/30 hover:border-cyan-500/60'
      }`}
    >
      {/* Node Header */}
      <div className="p-3.5 bg-gradient-to-r from-cyan-950/80 to-slate-900 rounded-t-2xl border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Repeat className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">{data.label || 'Loop (For Each)'}</h3>
            <p className="text-[10px] text-slate-400 font-mono">
              {config.collection ? String(config.collection).slice(0, 24) : 'Array Collection'}
            </p>
          </div>
        </div>

        {/* Mode Badge */}
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border ${
            isParallel
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
          }`}
        >
          {isParallel ? <Zap className="w-2.5 h-2.5" /> : <Cpu className="w-2.5 h-2.5" />}
          {isParallel ? `${concurrency}x Parallel` : 'Seq'}
        </span>
      </div>

      {/* Progress & Status Body */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          {/* Progress Ring */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r={radius} className="stroke-slate-800" strokeWidth="4" fill="transparent" />
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-cyan-400 transition-all duration-500 ease-out"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-slate-200">{progress.percent}%</span>
          </div>

          {/* Iteration Counter Metrics */}
          <div className="text-right space-y-0.5 font-mono">
            <div className="text-xs font-bold text-slate-200">
              {progress.completed} / {progress.totalItems || 0}
            </div>
            <div className="text-[10px] text-slate-400">Iterations</div>
            {progress.failed > 0 && (
              <span className="text-[10px] text-rose-400 font-semibold flex items-center justify-end gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> {progress.failed} Failed
              </span>
            )}
          </div>
        </div>

        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className="!w-3 !h-3 !bg-slate-900 !border-2 !border-cyan-400"
        />

        {/* Output Handles */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-semibold text-slate-400">
          <div className="flex items-center gap-1 text-cyan-400">
            <span>Loop Body</span>
            <Handle
              type="source"
              position={Position.Right}
              id="body"
              style={{ top: '65%' }}
              className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-slate-900"
            />
          </div>

          <div className="flex items-center gap-1 text-emerald-400">
            <span>Completed</span>
            <Handle
              type="source"
              position={Position.Right}
              id="completed"
              style={{ top: '85%' }}
              className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
