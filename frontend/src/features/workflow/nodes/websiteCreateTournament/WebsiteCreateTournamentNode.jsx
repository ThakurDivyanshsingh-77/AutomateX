import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Trophy, Globe, CheckCircle2, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { NodeNotesAction } from '../components/NodeNotesAction';

const WebsiteCreateTournamentNode = ({ id, data, isConnectable, selected }) => {
  const config = data?.config || {};
  const dryRun = Boolean(config.dryRun);
  const endpoint = config.endpoint || '/api/v1/tournaments';
  const mappingCount = Array.isArray(config.fieldMapping) ? config.fieldMapping.length : 13;
  const isConfigured = Boolean(config.connectionId);

  return (
    <div
      className={`relative min-w-[260px] max-w-[320px] rounded-xl bg-white border transition-all duration-200 shadow-md group ${
        selected
          ? 'border-brand-500 shadow-brand-500/15 ring-2 ring-brand-500/25'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white hover:!scale-125 transition-transform"
      />

      {/* Header */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-violet-50 border border-violet-200 text-violet-600">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                {data?.label || 'Website → Create Tournament'}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <span>Apex Esports API</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {dryRun && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Dry Run
              </span>
            )}
            <NodeNotesAction nodeId={id} note={data?.note} />
          </div>
        </div>
      </div>


      {/* Body Content */}
      <div className="p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-600 truncate">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-mono">{endpoint}</span>
          </div>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 font-bold uppercase">
            {config.method || 'POST'}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] px-1 text-slate-600">
          <span>Field Mappings:</span>
          <span className="font-bold text-slate-800">{mappingCount} fields</span>
        </div>

        {/* Connection status indicator */}
        <div className="pt-1 flex items-center justify-between text-[10px] border-t border-slate-100">
          {isConfigured ? (
            <div className="flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Connection linked</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-700 font-bold">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>Select connection</span>
            </div>
          )}

          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">
            {config.duplicateStrategy || 'skip dupe'}
          </span>
        </div>
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white hover:!scale-125 transition-transform"
      />
    </div>
  );
};
export default memo(WebsiteCreateTournamentNode);
