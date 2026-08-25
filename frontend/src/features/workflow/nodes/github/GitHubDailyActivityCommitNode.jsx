import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitCommit, Calendar, CheckCircle2, ShieldCheck, Github } from 'lucide-react';
import { NodeNotesAction } from '../components/NodeNotesAction';

export const GitHubDailyActivityCommitNode = memo(({ id, data, selected }) => {
  const config = data?.config || {};
  const repository = config.repository || config.profileRepo || 'username/repository';
  const branch = config.branch || 'main';
  const activityFile = config.activityFile || '.github/automatex/activity.md';

  return (
    <div
      className={`min-w-[260px] rounded-2xl bg-white border border-t-[4px] border-t-purple-600 transition-all duration-200 shadow-md ${
        selected ? 'ring-2 ring-purple-500 shadow-xl border-purple-500' : 'border-slate-200 hover:shadow-lg'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-purple-600 !border-2 !border-white shadow-sm"
      />

      <div className="p-3.5 space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-slate-900 text-white shadow-xs">
              <Github className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                  GitHub • ACTIVITY
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 tracking-tight mt-0.5">
                {data?.label || 'GitHub → Daily Activity Commit'}
              </h4>
            </div>
          </div>
          <NodeNotesAction nodeId={id} />
        </div>

        {/* Target Details */}
        <div className="space-y-1 rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px]">Repository:</span>
            <span className="font-mono text-[10px] font-semibold text-slate-700 truncate max-w-[150px]" title={repository}>
              {repository}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px]">Activity File:</span>
            <span className="font-mono text-[9px] text-slate-600 truncate max-w-[150px]" title={activityFile}>
              {activityFile}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px]">
            <span className="flex items-center gap-1 text-slate-600">
              <Calendar className="w-3 h-3 text-purple-500" />
              Daily
            </span>
            <span className="flex items-center gap-1 font-medium text-emerald-700">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Idempotent
            </span>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-purple-600 !border-2 !border-white shadow-sm"
      />
    </div>
  );
});

export default GitHubDailyActivityCommitNode;
