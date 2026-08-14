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
      className={`min-w-[240px] max-w-[300px] rounded-xl bg-slate-900 border transition-all duration-200 shadow-xl ${
        selected
          ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-amber-500/10'
          : executionStatus === 'RUNNING'
          ? 'border-amber-500 animate-pulse ring-2 ring-amber-500/20'
          : executionStatus === 'SUCCESS'
          ? 'border-emerald-500/80 shadow-emerald-500/5'
          : executionStatus === 'FAILED'
          ? 'border-rose-500 ring-2 ring-rose-500/20'
          : isInvalid
          ? 'border-amber-500/60 ring-1 ring-amber-500/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Target Connection Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-amber-500 !w-3 !h-3 !-left-[7px] border-2 border-slate-900"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800/60 bg-slate-900/50 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-amber-500/10 text-amber-400 border-amber-500/20">
            <Repeat className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-slate-200 truncate">
              {data?.label || 'For Each Product'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              CONTROL / FLOW
            </span>
          </div>
        </div>

        {total !== null ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-medium">
            {total} Items
          </span>
        ) : (
          <Repeat className="w-3.5 h-3.5 text-amber-400" />
        )}
      </div>

      {/* Node Body */}
      <div className="p-3 text-[11px] text-slate-400 bg-slate-950/40 rounded-b-xl space-y-1.5">
        <p className="text-[11px] text-slate-300 leading-snug">
          Process products array one-by-one sequentially.
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
          <span>Mode: Sequential</span>
          <span>Var: currentItem</span>
        </div>
      </div>

      {/* Source Connection Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-amber-500 !w-3 !h-3 !-right-[7px] border-2 border-slate-900"
      />
    </div>
  );
});
