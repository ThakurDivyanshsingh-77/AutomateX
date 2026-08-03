import React from 'react';
import { Activity, Clock, Cpu, HardDrive, Zap } from 'lucide-react';

export const PerformancePanel = ({ metrics = {} }) => {
  const { totalDurationMs = 0, stepCount = 0, averageStepDurationMs = 0, slowestStep, fastestStep, memorySnapshot = {} } = metrics;

  return (
    <div className="space-y-4 font-sans text-xs">
      <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Activity className="w-3.5 h-3.5 text-indigo-400" />
        Performance & Resource Metrics
      </h4>

      {/* Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-400" /> Total Time
          </span>
          <div className="text-base font-bold font-mono text-white">
            {totalDurationMs} <span className="text-xs text-slate-400 font-normal">ms</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Avg Latency
          </span>
          <div className="text-base font-bold font-mono text-white">
            {averageStepDurationMs} <span className="text-xs text-slate-400 font-normal">ms</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-emerald-400" /> Heap Used
          </span>
          <div className="text-base font-bold font-mono text-white">
            {memorySnapshot.heapUsedMb || 0} <span className="text-xs text-slate-400 font-normal">MB</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Cpu className="w-3 h-3 text-purple-400" /> RSS Memory
          </span>
          <div className="text-base font-bold font-mono text-white">
            {memorySnapshot.rssMb || 0} <span className="text-xs text-slate-400 font-normal">MB</span>
          </div>
        </div>
      </div>

      {/* Step Extremes Breakdown */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[11px]">
        {slowestStep && (
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-500">Slowest Step:</span>
            <span className="text-rose-400 font-bold">
              {slowestStep.nodeName} ({slowestStep.durationMs}ms)
            </span>
          </div>
        )}
        {fastestStep && (
          <div className="flex items-center justify-between text-slate-300 border-t border-slate-900 pt-1.5">
            <span className="text-slate-500">Fastest Step:</span>
            <span className="text-emerald-400 font-bold">
              {fastestStep.nodeName} ({fastestStep.durationMs}ms)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
