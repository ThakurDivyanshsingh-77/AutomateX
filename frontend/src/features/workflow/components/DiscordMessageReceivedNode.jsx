import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

export const DiscordMessageReceivedNode = memo(({ data, selected }) => {
  const config = data?.config || {};
  const guildLabel = config.guildId && config.guildId !== 'all' ? `Guild: ${config.guildId}` : 'All Servers';
  const channelLabel = config.channelId && config.channelId !== 'all' ? `Channel: ${config.channelId}` : 'All Channels';

  return (
    <div
      className={`min-w-[240px] rounded-xl bg-slate-900 border transition-all duration-200 shadow-xl ${
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-slate-800/60 bg-slate-900/50 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-slate-200 truncate">
              {data?.label || 'Discord → Message Received'}
            </h4>
            <span className="text-[10px] text-indigo-400 font-mono tracking-tight uppercase">
              TRIGGER
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 text-[11px] text-slate-400 bg-slate-950/40 rounded-b-xl space-y-1 font-mono text-[10px]">
        <div className="text-indigo-300 flex items-center justify-between">
          <span>{guildLabel}</span>
        </div>
        <div className="text-slate-400 flex items-center justify-between">
          <span>{channelLabel}</span>
        </div>
        {config.ignoreBotMessages !== false && (
          <div className="text-emerald-400 text-[9px] pt-0.5">
            ✓ Ignore Bot Messages
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-indigo-500 !w-3 !h-3 !-right-[7px] border-2 border-slate-900 cursor-pointer"
      />
    </div>
  );
});

export default DiscordMessageReceivedNode;
