import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Repeat, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { forEachProductManifest } from './forEachProductManifest';
import { NodeNotesAction } from '../components/NodeNotesAction';

export const ForEachProductNode = memo(({ id, data, selected }) => {
  const config = data?.config || {};
  const validation = forEachProductManifest.validate(config);
  const isInvalid = !validation.isValid;
  const executionStatus = data?.executionStatus;

  const total = data?.output?.totalItems !== undefined ? data.output.totalItems : null;

  return (
    <div
      className={`min-w-[240px] max-w-[300px] rounded-xl bg-white border border-t-[3px] border-t-cyan-500 transition-all duration-200 shadow-md ${
        selected
          ? 'border-cyan-500 ring-2 ring-cyan-500/25 shadow-cyan-500/15'
          : executionStatus === 'RUNNING'
          ? 'border-amber-500 animate-pulse ring-2 ring-amber-500/20'
          : executionStatus === 'SUCCESS'
          ? 'border-emerald-500 shadow-emerald-500/10'
          : executionStatus === 'FAILED'
          ? 'border-rose-500 ring-2 ring-rose-500/20'
          : isInvalid
          ? 'border-amber-400 ring-1 ring-amber-400/30'
          : 'border-slate-200 hover:border-cyan-300'
      }`}
    >
      {/* Target Connection Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-cyan-500 !w-3 !h-3 !-left-[7px] border-2 border-white"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-lg gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-cyan-50 text-cyan-600 border-cyan-200 shrink-0">
            <Repeat className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'For Each Product'}
            </h4>
            <span className="text-[9px] font-mono font-bold tracking-tight uppercase px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
              LOOP • ITERATOR
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {total !== null ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 font-mono font-bold">
              {total} Items
            </span>
          ) : (
            <Repeat className="w-3.5 h-3.5 text-cyan-500" />
          )}
          <NodeNotesAction nodeId={id} note={data?.note} />
        </div>
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
        className="!bg-cyan-500 !w-3 !h-3 !-right-[7px] border-2 border-white"
      />
    </div>
  );
});

export default ForEachProductNode;
