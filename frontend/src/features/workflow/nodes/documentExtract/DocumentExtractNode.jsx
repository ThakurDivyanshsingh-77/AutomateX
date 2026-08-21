import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, CheckCircle2, AlertTriangle, FileSearch, Layers } from 'lucide-react';
import { documentExtractManifest } from './documentExtractManifest';
import { NodeNotesAction } from '../components/NodeNotesAction';

export const DocumentExtractNode = memo(({ id, data, selected }) => {
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
      className={`min-w-[240px] max-w-[300px] rounded-xl bg-white border transition-all duration-200 shadow-md ${
        selected
          ? 'border-brand-500 ring-2 ring-brand-500/25 shadow-brand-500/15'
          : status === 'RUNNING'
          ? 'border-amber-500 animate-pulse ring-2 ring-amber-500/20'
          : status === 'SUCCESS'
          ? 'border-emerald-500 shadow-emerald-500/10'
          : status === 'FAILED'
          ? 'border-rose-500 ring-2 ring-rose-500/20'
          : isInvalid
          ? 'border-amber-400 ring-1 ring-amber-400/30'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Target Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-indigo-500 !w-3 !h-3 !-left-[7px] border-2 border-white"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-indigo-50 text-indigo-600 border-indigo-200">
            <FileSearch className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'Document → Extract Content'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              DOCUMENT
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isInvalid ? (
            <AlertTriangle
              className="w-4 h-4 text-amber-500 shrink-0"
              title={Object.values(validation.errors).join(', ')}
            />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <NodeNotesAction nodeId={id} note={data?.note} />
        </div>
      </div>

      {/* Node Content / Config Preview */}
      <div className="p-3 text-[11px] text-slate-600 bg-slate-50/70 rounded-b-xl space-y-1.5">
        <div className="flex items-center justify-between font-mono text-[10px]">
          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold capitalize">
            {mode} Mode
          </span>
          <span className="truncate text-slate-600 max-w-[130px]" title={String(displayFileRef)}>
            {String(displayFileRef)}
          </span>
        </div>

        {stats ? (
          <div className="text-[10px] text-emerald-700 font-mono font-semibold flex items-center justify-between pt-1 border-t border-slate-200">
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
        className="!bg-indigo-500 !w-3 !h-3 !-right-[7px] border-2 border-white"
      />
    </div>
  );
});

