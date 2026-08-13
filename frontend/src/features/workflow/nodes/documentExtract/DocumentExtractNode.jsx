import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, CheckCircle2, AlertTriangle, FileSearch, Layers } from 'lucide-react';
import { documentExtractManifest } from './documentExtractManifest';

export const DocumentExtractNode = memo(({ data, selected }) => {
  const config = data?.config || {};
  const validation = documentExtractManifest.validate(config);
  const isInvalid = !validation.isValid;

  const status = data?.executionStatus; // 'RUNNING' | 'SUCCESS' | 'FAILED'
  const outputData = data?.output || {};
  const stats = outputData.stats || null;

  const displayFileRef = outputData.file?.name || config.fileId || config.file?.id || config.file || 'No file selected';
  const mode = config.extractionMode || 'full';

  return (
    <div
      className={`min-w-[240px] max-w-[300px] rounded-xl bg-slate-900 border transition-all duration-200 shadow-xl ${
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10'
          : status === 'RUNNING'
          ? 'border-amber-500 animate-pulse ring-2 ring-amber-500/20'
          : status === 'SUCCESS'
          ? 'border-emerald-500/80 shadow-emerald-500/5'
          : status === 'FAILED'
          ? 'border-rose-500 ring-2 ring-rose-500/20'
          : isInvalid
          ? 'border-amber-500/60 ring-1 ring-amber-500/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Target Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-indigo-500 !w-3 !h-3 !-left-[7px] border-2 border-slate-900"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800/60 bg-slate-900/50 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            <FileSearch className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-slate-200 truncate">
              {data?.label || 'Document → Extract Content'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              DOCUMENT
            </span>
          </div>
        </div>

        {isInvalid ? (
          <AlertTriangle
            className="w-4 h-4 text-amber-400 shrink-0"
            title={Object.values(validation.errors).join(', ')}
          />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 opacity-80" />
        )}
      </div>

      {/* Node Content / Config Preview */}
      <div className="p-3 text-[11px] text-slate-400 bg-slate-950/40 rounded-b-xl space-y-1.5">
        <div className="flex items-center justify-between font-mono text-[10px]">
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold capitalize">
            {mode} Mode
          </span>
          <span className="truncate text-slate-400 max-w-[130px]" title={String(displayFileRef)}>
            {String(displayFileRef)}
          </span>
        </div>

        {stats ? (
          <div className="text-[10px] text-emerald-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>{stats.characters} chars</span>
            <span>•</span>
            <span>{stats.paragraphs} paras</span>
            <span>•</span>
            <span>{stats.tables} tables</span>
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 truncate italic">
            Extracts paragraphs, headings & tables
          </div>
        )}
      </div>

      {/* Source Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-indigo-500 !w-3 !h-3 !-right-[7px] border-2 border-slate-900"
      />
    </div>
  );
});
