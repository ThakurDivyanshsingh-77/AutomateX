import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { PackagePlus, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { websiteCreateProductManifest } from './websiteCreateProductManifest';
import { NodeNotesAction } from '../components/NodeNotesAction';

export const WebsiteCreateProductNode = memo(({ id, data, selected }) => {
  const config = data?.config || {};
  const validation = websiteCreateProductManifest.validate(config);
  const isInvalid = !validation.isValid;
  const executionStatus = data?.executionStatus; // 'RUNNING' | 'SUCCESS' | 'FAILED'

  const isDryRun = Boolean(config.dryRun);
  const summary = data?.output?.summary;

  return (
    <div
      className={`min-w-[250px] max-w-[320px] rounded-xl bg-white border transition-all duration-200 shadow-md ${
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
        className="!bg-emerald-500 !w-3 !h-3 !-left-[7px] border-2 border-white"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200">
            <PackagePlus className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'Website → Create Product'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              INTEGRATIONS / WEBSITE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isDryRun ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono font-bold">
              Dry Run
            </span>
          ) : (
            <PackagePlus className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <NodeNotesAction nodeId={id} note={data?.note} />
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3 text-[11px] text-slate-600 bg-slate-50/70 rounded-b-xl space-y-2">
        <p className="text-[11px] text-slate-700 leading-snug">
          Create product on target website via mapped REST API endpoint.
        </p>

        {summary ? (
          <div className="p-2 rounded bg-white border border-slate-200 text-[10px] font-mono flex items-center justify-between">
            <span className="text-emerald-700 font-bold">✓ {summary.created} Created</span>
            {summary.failed > 0 && <span className="text-rose-700 font-bold">✕ {summary.failed} Failed</span>}
            {summary.skipped > 0 && <span className="text-amber-700 font-bold">⚠ {summary.skipped} Skipped</span>}
          </div>
        ) : (
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5 border-t border-slate-200">
            <span>{config.method || 'POST'} {config.endpoint || '/api/products'}</span>
            <span>{config.duplicateStrategy || 'skip'} dupes</span>
          </div>
        )}
      </div>

      {/* Source Connection Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-emerald-500 !w-3 !h-3 !-right-[7px] border-2 border-white"
      />
    </div>
  );
});

