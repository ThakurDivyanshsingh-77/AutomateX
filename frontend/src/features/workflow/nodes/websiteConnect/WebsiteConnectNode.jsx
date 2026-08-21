import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe, CheckCircle2, AlertTriangle, XCircle, Link2 } from 'lucide-react';
import { websiteConnectManifest } from './websiteConnectManifest';

export const WebsiteConnectNode = memo(({ data, selected }) => {
  const config = data?.config || {};
  const validation = websiteConnectManifest.validate(config);
  const isInvalid = !validation.isValid;

  const websiteUrl = config.websiteUrl || (config.website?.url) || '';
  const domain = websiteUrl
    ? websiteUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
    : null;

  const methodDisplay = (config.connectionMethod || 'REST API')
    .replace(/([A-Z])/g, ' $1')
    .toUpperCase();

  const isConnected = config.status === 'connected' || (config.connectionId && config.status !== 'error');
  const isError = config.status === 'error';
  const executionStatus = data?.executionStatus; // 'RUNNING' | 'SUCCESS' | 'FAILED'

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
          : isConnected
          ? 'border-cyan-400 ring-1 ring-cyan-400/20'
          : isError
          ? 'border-rose-400 ring-1 ring-rose-400/30'
          : isInvalid
          ? 'border-amber-400 ring-1 ring-amber-400/30'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Target Connection Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-cyan-500 !w-3 !h-3 !-left-[7px] border-2 border-white"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-cyan-50 text-cyan-700 border-cyan-200">
            <Globe className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'Website → Connect'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              INTEGRATION
            </span>
          </div>
        </div>

        {isConnected ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : isError ? (
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
        ) : isInvalid ? (
          <AlertTriangle
            className="w-4 h-4 text-amber-500 shrink-0"
            title={Object.values(validation.errors).join(', ')}
          />
        ) : (
          <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </div>

      {/* Node Content / Connection Status */}
      <div className="p-3 text-[11px] text-slate-600 bg-slate-50/70 rounded-b-xl space-y-1.5">
        {isConnected && domain ? (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>Connected</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="text-slate-800 font-bold truncate max-w-[150px]">{domain}</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold uppercase shrink-0">
                {methodDisplay}
              </span>
            </div>
          </div>
        ) : isError ? (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-rose-700 font-bold text-[11px]">
              <XCircle className="w-3.5 h-3.5" />
              <span>Connection Error</span>
            </div>
            <p className="text-[10px] text-rose-600 truncate">
              {config.errorMessage || 'Failed to authenticate endpoint'}
            </p>
          </div>
        ) : (
          <div className="text-slate-400 italic text-[11px] flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>Target website not configured...</span>
          </div>
        )}
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
