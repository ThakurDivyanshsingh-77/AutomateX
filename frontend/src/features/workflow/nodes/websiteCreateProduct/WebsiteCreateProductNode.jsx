import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { PackagePlus, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { websiteCreateProductManifest } from './websiteCreateProductManifest';

export const WebsiteCreateProductNode = memo(({ data, selected }) => {
  const config = data?.config || {};
  const validation = websiteCreateProductManifest.validate(config);
  const isInvalid = !validation.isValid;
  const executionStatus = data?.executionStatus; // 'RUNNING' | 'SUCCESS' | 'FAILED'

  const isDryRun = Boolean(config.dryRun);
  const summary = data?.output?.summary;

  return (
    <div
      className={`min-w-[250px] max-w-[320px] rounded-xl bg-slate-900 border transition-all duration-200 shadow-xl ${
        selected
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10'
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
        className="!bg-emerald-500 !w-3 !h-3 !-left-[7px] border-2 border-slate-900"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800/60 bg-slate-900/50 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <PackagePlus className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-slate-200 truncate">
              {data?.label || 'Website → Create Product'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              INTEGRATIONS / WEBSITE
            </span>
          </div>
        </div>

        {isDryRun ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-medium">
            Dry Run
          </span>
        ) : (
          <PackagePlus className="w-3.5 h-3.5 text-emerald-400" />
        )}
      </div>

      {/* Node Body */}
      <div className="p-3 text-[11px] text-slate-400 bg-slate-950/40 rounded-b-xl space-y-2">
        <p className="text-[11px] text-slate-300 leading-snug">
          Create product on target website via mapped REST API endpoint.
        </p>

        {summary ? (
          <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono flex items-center justify-between">
            <span className="text-emerald-400">✓ {summary.created} Created</span>
            {summary.failed > 0 && <span className="text-rose-400">✕ {summary.failed} Failed</span>}
            {summary.skipped > 0 && <span className="text-amber-400">⚠ {summary.skipped} Skipped</span>}
          </div>
        ) : (
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
            <span>{config.method || 'POST'} {config.endpoint || '/api/products'}</span>
            <span>{config.duplicateStrategy || 'skip'} dupes</span>
          </div>
        )}
      </div>

      {/* Source Connection Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-emerald-500 !w-3 !h-3 !-right-[7px] border-2 border-slate-900"
      />
    </div>
  );
});
