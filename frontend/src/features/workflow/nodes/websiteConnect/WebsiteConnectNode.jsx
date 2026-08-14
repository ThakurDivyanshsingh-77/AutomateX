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
      className={`min-w-[240px] max-w-[300px] rounded-xl bg-slate-900 border transition-all duration-200 shadow-xl ${
        selected
          ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-cyan-500/10'
          : executionStatus === 'RUNNING'
          ? 'border-amber-500 animate-pulse ring-2 ring-amber-500/20'
          : executionStatus === 'SUCCESS'
          ? 'border-emerald-500/80 shadow-emerald-500/5'
          : executionStatus === 'FAILED'
          ? 'border-rose-500 ring-2 ring-rose-500/20'
          : isConnected
          ? 'border-cyan-500/60 ring-1 ring-cyan-500/10'
          : isError
          ? 'border-rose-500/60 ring-1 ring-rose-500/20'
          : isInvalid
          ? 'border-amber-500/60 ring-1 ring-amber-500/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Target Connection Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-cyan-500 !w-3 !h-3 !-left-[7px] border-2 border-slate-900"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800/60 bg-slate-900/50 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
            <Globe className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-slate-200 truncate">
              {data?.label || 'Website → Connect'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              INTEGRATION
            </span>
          </div>
        </div>

        {isConnected ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : isError ? (
          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
        ) : isInvalid ? (
          <AlertTriangle
            className="w-4 h-4 text-amber-400 shrink-0"
            title={Object.values(validation.errors).join(', ')}
          />
        ) : (
          <Link2 className="w-4 h-4 text-slate-500 shrink-0" />
        )}
      </div>

      {/* Node Content / Connection Status */}
      <div className="p-3 text-[11px] text-slate-400 bg-slate-950/40 rounded-b-xl space-y-1.5">
        {isConnected && domain ? (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>Connected</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="text-slate-200 font-semibold truncate max-w-[150px]">{domain}</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase shrink-0">
                {methodDisplay}
              </span>
            </div>
          </div>
        ) : isError ? (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-rose-400 font-medium text-[11px]">
              <XCircle className="w-3.5 h-3.5" />
              <span>Connection Error</span>
            </div>
            <p className="text-[10px] text-slate-500 truncate">
              {config.lastError || 'Authentication failed'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-[11px] text-slate-300 leading-snug">
              Connect AutomateX to an external website using API or browser authentication.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-medium pt-0.5">
              <AlertTriangle className="w-3 h-3" />
              <span>Not Connected</span>
            </div>
          </div>
        )}
      </div>

      {/* Source Connection Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-cyan-500 !w-3 !h-3 !-right-[7px] border-2 border-slate-900"
      />
    </div>
  );
});
