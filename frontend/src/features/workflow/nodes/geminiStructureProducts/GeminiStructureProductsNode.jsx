import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, Layers, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { geminiStructureProductsManifest } from './geminiStructureProductsManifest';

export const GeminiStructureProductsNode = memo(({ data, selected }) => {
  const config = data?.config || {};
  const validation = geminiStructureProductsManifest.validate(config);
  const isInvalid = !validation.isValid;
  const executionStatus = data?.executionStatus; // 'RUNNING' | 'SUCCESS' | 'FAILED'

  const productCount = data?.output?.count || data?.output?.products?.length || null;

  return (
    <div
      className={`min-w-[240px] max-w-[300px] rounded-xl bg-slate-900 border transition-all duration-200 shadow-xl ${
        selected
          ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-purple-500/10'
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
        className="!bg-purple-500 !w-3 !h-3 !-left-[7px] border-2 border-slate-900"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800/60 bg-slate-900/50 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-purple-500/10 text-purple-400 border-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-slate-200 truncate">
              {data?.label || 'Gemini → Structure Products'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              AI / DOCUMENT
            </span>
          </div>
        </div>

        {productCount !== null ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-medium">
            {productCount} Products
          </span>
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        )}
      </div>

      {/* Node Body */}
      <div className="p-3 text-[11px] text-slate-400 bg-slate-950/40 rounded-b-xl space-y-1.5">
        <p className="text-[11px] text-slate-300 leading-snug">
          Convert extracted document content into structured product records.
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
          <span className="truncate">Model: {config.model || 'gemini-1.5-flash'}</span>
          <span>Temp: {config.temperature !== undefined ? config.temperature : 0.1}</span>
        </div>
      </div>

      {/* Source Connection Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-purple-500 !w-3 !h-3 !-right-[7px] border-2 border-slate-900"
      />
    </div>
  );
});
