import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ShieldAlert, ShieldCheck, Bug } from 'lucide-react';

export const TryCatchNode = ({ data, selected }) => {
  return (
    <div
      className={`min-w-[240px] bg-white border rounded-2xl p-3.5 shadow-md transition-all font-sans select-none relative ${
        selected
          ? 'border-brand-500 ring-2 ring-brand-500/25 shadow-brand-500/15'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Target Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              {data.label || 'Try / Catch'}
            </h3>
            <span className="text-[10px] font-mono text-indigo-700 uppercase block">
              LOGIC / ERROR INTERCEPTOR
            </span>
          </div>
        </div>
      </div>

      {/* Handles Labels Summary */}
      <div className="space-y-1.5 font-mono text-[10px]">
        <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" /> TRY PATH
          </span>
          <span className="text-emerald-700">Normal Flow</span>
        </div>

        <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold">
          <span className="flex items-center gap-1">
            <Bug className="w-3 h-3 text-rose-600" /> CATCH PATH
          </span>
          <span className="text-rose-700">Error Flow</span>
        </div>
      </div>

      {/* Source Handle (TRY - Top Right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="try"
        style={{ top: '35%' }}
        className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-white hover:!bg-emerald-600 transition-colors"
      />

      {/* Source Handle (CATCH - Bottom Right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="catch"
        style={{ top: '70%' }}
        className="!bg-rose-500 !w-3 !h-3 !border-2 !border-white hover:!bg-rose-600 transition-colors"
      />
    </div>
  );
};

