import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Github, GitBranch, FileText, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { NodeNotesAction } from '../components/NodeNotesAction';

export const GitHubSyncProfileReadmeNode = memo(({ id, data, selected }) => {
  const config = data?.config || {};
  const repoName = config.profileRepo || 'username/username';
  const branch = config.branch || 'main';
  const sortBy = config.sortBy || 'updated';
  const maxProjects = config.maxProjects || 10;

  return (
    <div
      className={`min-w-[260px] rounded-2xl bg-white border border-t-[4px] border-t-purple-600 transition-all duration-200 shadow-md ${
        selected
          ? 'border-purple-500 ring-2 ring-purple-500/25 shadow-purple-500/15'
          : 'border-slate-200 hover:border-purple-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-purple-600 !w-3 !h-3 !-left-[7px] border-2 border-white shadow-xs"
      />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/70 rounded-t-xl gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-slate-900 text-white shadow-xs shrink-0 flex items-center justify-center">
            <Github className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'Sync Profile README'}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-mono font-bold tracking-tight uppercase px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                GITHUB • README
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                v1.0
              </span>
            </div>
          </div>
        </div>

        <NodeNotesAction nodeId={id} note={data?.note} noteColor={data?.noteColor} noteTag={data?.noteTag} />
      </div>

      {/* Body Content */}
      <div className="p-3 bg-white space-y-2 text-xs">
        {/* Repo & Branch Info */}
        <div className="flex items-center justify-between gap-1 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 min-w-0 text-slate-700 font-mono text-[11px]">
            <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="truncate font-semibold text-slate-900">
              {repoName}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
            <GitBranch className="w-3 h-3 text-slate-400" />
            <span>{branch}</span>
          </div>
        </div>

        {/* Sync Settings Summary */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-0.5">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Sort:</span>
            <span className="font-semibold text-purple-700 capitalize">{sortBy}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Max:</span>
            <span className="font-bold text-slate-700 font-mono">{maxProjects} repos</span>
          </div>
        </div>

        {/* Safety Indicator */}
        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-emerald-700">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Managed Markers Protected</span>
          </span>
          <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 py-0.5 rounded">
            Idempotent
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-purple-600 !w-3 !h-3 !-right-[7px] border-2 border-white shadow-xs"
      />
    </div>
  );
});

export default GitHubSyncProfileReadmeNode;
