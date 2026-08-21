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
      className={`min-w-[230px] rounded-xl bg-white border transition-all duration-200 shadow-md ${
        selected
          ? 'border-brand-500 ring-2 ring-brand-500/25 shadow-brand-500/15'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-indigo-50 text-indigo-600 border-indigo-200">
            <Clock className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'Cron Schedule'}
            </h4>
            <span className="text-[10px] text-indigo-700 font-mono tracking-tight uppercase">
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
          <span className="text-indigo-700 font-medium">{timezone}</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-indigo-500 !w-3 !h-3 !-right-[7px] border-2 border-white"
      />
    </div>
  );
});

