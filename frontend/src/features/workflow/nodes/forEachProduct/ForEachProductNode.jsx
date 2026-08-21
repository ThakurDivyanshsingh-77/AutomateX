import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Repeat, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { forEachProductManifest } from './forEachProductManifest';

export const ForEachProductNode = memo(({ data, selected }) => {
  const config = data?.config || {};
  const validation = forEachProductManifest.validate(config);
  const isInvalid = !validation.isValid;
  const executionStatus = data?.executionStatus; // 'RUNNING' | 'SUCCESS' | 'FAILED'

  const total = data?.output?.totalItems !== undefined ? data.output.totalItems : null;

  return (
    <div
      className={`min-w-[240px] max-w-[300px] rounded-xl bg-white border transition-all duration-200 shadow-md ${
        selected
          ? 'border-brand-500 ring-2 ring-brand-500/25 shadow-brand-500/15'
          : executionStatus === 'RUNNING'
          ? 'border-amber-500 animate-pulse ring-2 ring-amber-500/20'
          : executionStatus === 'SUCCESS'
          ? 'border-emerald-500 shadow-emerald-500/10'
          : executionStatus === 'FAILED'
          ? 'border-rose-500 ring-2 ring-rose-500/20'
          : isInvalid
          ? 'border-amber-400 ring-1 ring-amber-400/30'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Target Connection Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-amber-500 !w-3 !h-3 !-left-[7px] border-2 border-white"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-amber-50 text-amber-600 border-amber-200">
            <Repeat className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'For Each Product'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              CONTROL / FLOW
            </span>
          </div>
        </div>

        {total !== null ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono font-bold">
            {total} Items
          </span>
        ) : (
          <Repeat className="w-3.5 h-3.5 text-amber-500" />
        )}
      </div>

      {/* Node Body */}
      <div className="p-3 text-[11px] text-slate-600 bg-slate-50/70 rounded-b-xl space-y-1.5">
        <p className="text-[11px] text-slate-700 leading-snug">
          Process products array one-by-one sequentially.
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200">
          <span>Mode: Sequential</span>
          <span>Var: currentItem</span>
        </div>
      </div>

      {/* Source Connection Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-amber-500 !w-3 !h-3 !-right-[7px] border-2 border-white"
      />
    </div>
  );
});

