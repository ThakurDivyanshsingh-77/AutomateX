import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { NODE_REGISTRY } from '../nodeRegistry';
import { Zap, Play } from 'lucide-react';

export const CustomNode = memo(({ id, type, data, selected }) => {
  const meta = NODE_REGISTRY[type] || {
    label: data?.label || type,
    category: 'ACTION',
    icon: Zap,
    badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const IconComponent = meta.icon || Zap;
  const isTrigger = meta.category === 'TRIGGER' || meta.category === 'Triggers' || type === 'discordMessageReceived' || type === 'discordMessageReceivedTrigger';
  const config = data?.config || {};

  // Status highlights during active test execution
  const status = data?.executionStatus; // 'RUNNING' | 'SUCCESS' | 'FAILED'

  return (
    <div
      className={`relative min-w-[240px] max-w-[300px] rounded-xl bg-slate-900 border transition-all duration-200 shadow-xl ${
        selected
          ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-brand-500/10'
          : status === 'RUNNING'
          ? 'border-amber-500 animate-pulse ring-2 ring-amber-500/20'
          : status === 'SUCCESS'
          ? 'border-emerald-500/80 shadow-emerald-500/5'
          : status === 'FAILED'
          ? 'border-rose-500 ring-2 ring-rose-500/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Target Handle (Left) - Not shown for initial trigger nodes */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-brand-500 !w-3 !h-3 !-left-[7px] border-2 border-slate-900"
        />
      )}

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800/60 bg-slate-900/50 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-1.5 rounded-lg border ${meta.badgeColor}`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-slate-200 truncate">
              {data?.label || meta.label}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              {meta.category}
            </span>
          </div>
        </div>

        {/* Status Badge if executing */}
        {status && (
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
              status === 'RUNNING'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : status === 'SUCCESS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {status}
          </span>
        )}
      </div>

      {/* Node Configuration Preview Body */}
      <div className="p-3 text-[11px] text-slate-400 space-y-1 bg-slate-950/40 rounded-b-xl">
        {type === 'HTTP_REQUEST' && (
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="px-1 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
              {config.method || 'GET'}
            </span>
            <span className="truncate text-slate-300">
              {config.url || 'https://...'}
            </span>
          </div>
        )}

        {type === 'DELAY' && (
          <div className="text-slate-300">
            Wait for <span className="font-semibold text-amber-400">{config.seconds || 1}s</span>
          </div>
        )}

        {type === 'CODE_TRANSFORM' && (
          <div className="font-mono text-[10px] text-cyan-400 truncate">
            {config.code ? config.code.split('\n')[0] : 'Transform JS code'}
          </div>
        )}

        {type === 'CONDITION' && (
          <div className="font-mono text-[10px] text-rose-300 truncate">
            If {config.field || 'field'} {config.operator || 'equals'} {config.value || 'val'}
          </div>
        )}

        {type === 'LOG_ACTION' && (
          <div className="truncate text-slate-300">
            "{config.message || 'Log message'}"
          </div>
        )}

        {type === 'WEBHOOK_TRIGGER' && (
          <div className="text-[10px] font-mono text-purple-400 truncate">
            POST /api/v1/webhooks/:token
          </div>
        )}

        {type === 'MANUAL_TRIGGER' && (
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <Play className="w-3 h-3 fill-emerald-400/20" /> On demand trigger
          </div>
        )}
      </div>

      {/* Source Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-brand-500 !w-3 !h-3 !-right-[7px] border-2 border-slate-900"
      />
    </div>
  );
});
