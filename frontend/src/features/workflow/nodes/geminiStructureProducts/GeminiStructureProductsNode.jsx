import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, Layers, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { geminiStructureProductsManifest } from './geminiStructureProductsManifest';
import { NodeNotesAction } from '../components/NodeNotesAction';

export const GeminiStructureProductsNode = memo(({ id, data, selected }) => {
  const config = data?.config || {};
  const validation = geminiStructureProductsManifest.validate(config);
  const isInvalid = !validation.isValid;
  const executionStatus = data?.executionStatus;

  const productCount = data?.output?.count || data?.output?.products?.length || null;

  return (
    <div
      className={`min-w-[240px] max-w-[300px] rounded-xl bg-white border border-t-[3px] border-t-amber-500 transition-all duration-200 shadow-md ${
        selected
          ? 'border-amber-500 ring-2 ring-amber-500/25 shadow-amber-500/15'
          : executionStatus === 'RUNNING'
          ? 'border-amber-500 animate-pulse ring-2 ring-amber-500/20'
          : executionStatus === 'SUCCESS'
          ? 'border-emerald-500 shadow-emerald-500/10'
          : executionStatus === 'FAILED'
          ? 'border-rose-500 ring-2 ring-rose-500/20'
          : isInvalid
          ? 'border-amber-400 ring-1 ring-amber-400/30'
          : 'border-slate-200 hover:border-amber-300'
      }`}
    >
      {/* Target Connection Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-amber-500 !w-3 !h-3 !-left-[7px] border-2 border-white"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-lg gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-amber-50 text-amber-600 border-amber-200 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'Gemini → Structure Products'}
            </h4>
            <span className="text-[9px] font-mono font-bold tracking-tight uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
              AI / DOCUMENT
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {productCount !== null ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
              {productCount} Products
            </span>
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          )}
          <NodeNotesAction nodeId={id} note={data?.note} />
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3 text-[11px] text-slate-600 bg-slate-50/70 rounded-b-xl space-y-1.5">
        <p className="text-[11px] text-slate-700 leading-snug">
          Convert extracted document content into structured product records.
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200">
          <span className="truncate">Model: {config.model || 'gemini-1.5-flash'}</span>
          <span>Temp: {config.temperature !== undefined ? config.temperature : 0.1}</span>
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

export default GeminiStructureProductsNode;
