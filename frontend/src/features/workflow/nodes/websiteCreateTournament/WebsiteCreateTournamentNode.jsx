import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Trophy, Globe, CheckCircle2, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';

const WebsiteCreateTournamentNode = ({ data, isConnectable, selected }) => {
  const config = data?.config || {};
  const dryRun = Boolean(config.dryRun);
  const endpoint = config.endpoint || '/api/v1/tournaments';
  const mappingCount = Array.isArray(config.fieldMapping) ? config.fieldMapping.length : 13;
  const isConfigured = Boolean(config.connectionId);

  return (
    <div
      className={`relative min-w-[260px] max-w-[320px] rounded-xl bg-slate-900/90 backdrop-blur-md border transition-all duration-200 shadow-xl group ${
        selected
          ? 'border-violet-500 shadow-violet-500/20 ring-2 ring-violet-500/30'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-violet-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform"
      />

      {/* Header */}
      <div className="p-3.5 border-b border-slate-800/80 bg-gradient-to-r from-violet-950/40 via-purple-950/20 to-transparent rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                {data?.label || 'Website → Create Tournament'}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <span>Apex Esports API</span>
              </div>
            </div>
          </div>

          {dryRun && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Dry Run
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px] bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-slate-400 truncate">
            <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{endpoint}</span>
          </div>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 font-semibold uppercase">
            {config.method || 'POST'}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
          <span>Field Mappings:</span>
          <span className="font-medium text-slate-200">{mappingCount} fields</span>
        </div>

        {/* Connection status indicator */}
        <div className="pt-1 flex items-center justify-between text-[10px]">
          {isConfigured ? (
            <div className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>Connection linked</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-400 font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>Select connection</span>
            </div>
          )}

          <span className="text-[9px] text-slate-500 uppercase tracking-wider">
            {config.duplicateStrategy || 'skip dupe'}
          </span>
        </div>
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-violet-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform"
      />
    </div>
  );
};

export default memo(WebsiteCreateTournamentNode);
