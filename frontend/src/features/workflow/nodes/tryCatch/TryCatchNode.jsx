import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ShieldAlert, ShieldCheck, Bug } from 'lucide-react';

export const TryCatchNode = ({ data, selected }) => {
  return (
    <div
      className={`min-w-[240px] bg-slate-900 border rounded-2xl p-3.5 shadow-2xl transition-all font-sans select-none relative ${
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Target Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-slate-900"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight">
              {data.label || 'Try / Catch'}
            </h3>
            <span className="text-[10px] font-mono text-indigo-400/80 uppercase block">
              LOGIC / ERROR INTERCEPTOR
            </span>
          </div>
        </div>
      </div>

      {/* Handles Labels Summary */}
      <div className="space-y-1.5 font-mono text-[10px]">
        <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> TRY PATH
          </span>
          <span className="text-emerald-400">Normal Flow</span>
        </div>

        <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-bold">
          <span className="flex items-center gap-1">
            <Bug className="w-3 h-3" /> CATCH PATH
          </span>
          <span className="text-rose-400">Error Flow</span>
        </div>
      </div>

      {/* Source Handle (TRY - Top Right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="try"
        style={{ top: '35%' }}
        className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-slate-900 hover:!bg-emerald-400 transition-colors"
      />

      {/* Source Handle (CATCH - Bottom Right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="catch"
        style={{ top: '70%' }}
        className="!bg-rose-500 !w-3 !h-3 !border-2 !border-slate-900 hover:!bg-rose-400 transition-colors"
      />
    </div>
  );
};
