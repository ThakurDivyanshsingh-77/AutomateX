import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';
import cronstrue from 'cronstrue';

export const CronNode = memo(({ data, selected }) => {
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
      className={`min-w-[230px] rounded-xl bg-slate-900 border transition-all duration-200 shadow-xl ${
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-slate-800/60 bg-slate-900/50 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-slate-200 truncate">
              {data?.label || 'Cron Schedule'}
            </h4>
            <span className="text-[10px] text-indigo-400 font-mono tracking-tight uppercase">
              SCHEDULE TRIGGER
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-950/40 rounded-b-xl space-y-1">
        <div className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
          <span className="truncate">{humanText}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>{cronExpression}</span>
          <span className="text-indigo-400/80">{timezone}</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-indigo-500 !w-3 !h-3 !-right-[7px] border-2 border-slate-900"
      />
    </div>
  );
});
