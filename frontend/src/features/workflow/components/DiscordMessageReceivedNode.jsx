import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';
import { NodeNotesAction } from '../nodes/components/NodeNotesAction';

export const DiscordMessageReceivedNode = memo(({ id, data, selected }) => {
  const config = data?.config || {};
  const guildLabel = config.guildId && config.guildId !== 'all' ? `Guild: ${config.guildId}` : 'All Servers';
  const channelLabel = config.channelId && config.channelId !== 'all' ? `Channel: ${config.channelId}` : 'All Channels';

  return (
    <div
      className={`min-w-[240px] rounded-xl bg-white border transition-all duration-200 shadow-md ${
        selected
          ? 'border-brand-500 ring-2 ring-brand-500/25 shadow-brand-500/15'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-indigo-50 text-indigo-600 border-indigo-200">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'Discord → Message Received'}
            </h4>
            <span className="text-[10px] text-indigo-700 font-mono tracking-tight uppercase">
              TRIGGER
            </span>
          </div>
        </div>

        <NodeNotesAction nodeId={id} note={data?.note} />
      </div>


      <div className="p-3 text-[11px] text-slate-600 bg-slate-50/70 rounded-b-xl space-y-1 font-mono text-[10px]">
        <div className="text-indigo-700 font-bold flex items-center justify-between">
          <span>{guildLabel}</span>
        </div>
        <div className="text-slate-600 flex items-center justify-between">
          <span>{channelLabel}</span>
        </div>
        {config.ignoreBotMessages !== false && (
          <div className="text-emerald-700 font-bold text-[9px] pt-0.5">
            ✓ Ignore Bot Messages
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-indigo-500 !w-3 !h-3 !-right-[7px] border-2 border-white cursor-pointer"
      />
    </div>
  );
});

export default DiscordMessageReceivedNode;

