import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';
import cronstrue from 'cronstrue';
import { NodeNotesAction } from '../components/NodeNotesAction';

export const CronNode = memo(({ id, data, selected }) => {
  const config = data?.config || {};
  const cronExpression = (config.cronExpression || '0 9 * * *').trim();
  const timezone = config.timezone || 'UTC';

  let humanText = 'Every day at 9:00 AM';
  try {
    humanText = cronstrue.toString(cronExpression);
  } catch (e) {
    humanText = cronExpression;
  }

  return (
    <div
      className={`min-w-[230px] rounded-xl bg-white border border-t-[3px] border-t-blue-500 transition-all duration-200 shadow-md ${
        selected
          ? 'border-blue-500 ring-2 ring-blue-500/25 shadow-blue-500/15'
          : 'border-slate-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-lg gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-blue-50 text-blue-600 border-blue-200 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'Cron Schedule'}
            </h4>
            <span className="text-[9px] font-mono font-bold tracking-tight uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 block">
              SCHEDULE TRIGGER
            </span>
          </div>
        </div>

        <NodeNotesAction nodeId={id} note={data?.note} />
      </div>

      <div className="p-3 bg-slate-50/70 rounded-b-xl space-y-1">
        <div className="text-[11px] font-semibold text-slate-800 flex items-center justify-between">
          <span className="truncate">{humanText}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>{cronExpression}</span>
          <span className="text-blue-700 font-bold">{timezone}</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-blue-500 !w-3 !h-3 !-right-[7px] border-2 border-white"
      />
    </div>
  );
});

export default CronNode;
