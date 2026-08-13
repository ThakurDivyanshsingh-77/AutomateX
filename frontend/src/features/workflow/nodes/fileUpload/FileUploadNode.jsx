import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { fileUploadManifest } from './fileUploadManifest';

export const FileUploadNode = memo(({ data, selected }) => {
  const config = data?.config || {};
  const validation = fileUploadManifest.validate(config);
  const isInvalid = !validation.isValid;

  const file = config.file;
  const fileName = file?.name || file?.originalName || (config.fileId ? `Document (${config.fileId})` : null);
  const fileExt = (file?.extension || '').replace('.', '').toUpperCase();
  const fileSizeStr = file?.size ? `${(file.size / 1024).toFixed(0)} KB` : '';

  const status = data?.executionStatus; // 'RUNNING' | 'SUCCESS' | 'FAILED'

  return (
    <div
      className={`min-w-[240px] max-w-[300px] rounded-xl bg-slate-900 border transition-all duration-200 shadow-xl ${
        selected
          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10'
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
      {/* Target Connection Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-blue-500 !w-3 !h-3 !-left-[7px] border-2 border-slate-900"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800/60 bg-slate-900/50 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-blue-500/10 text-blue-400 border-blue-500/20">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-slate-200 truncate">
              {data?.label || 'File → Upload Document'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              INPUT
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
      <div className="p-3 text-[11px] text-slate-400 bg-slate-950/40 rounded-b-xl space-y-1">
        {fileName ? (
          <div className="flex items-center justify-between font-mono text-[10px]">
            <div className="flex items-center gap-1.5 truncate max-w-[170px]">
              <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate text-slate-200 font-medium">{fileName}</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold uppercase shrink-0">
              {fileExt || 'DOCX'} {fileSizeStr ? `• ${fileSizeStr}` : ''}
            </span>
          </div>
        ) : (
          <div className="text-slate-500 italic text-[11px] flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
            <span>Upload a document for processing...</span>
          </div>
        )}
      </div>

      {/* Source Connection Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-blue-500 !w-3 !h-3 !-right-[7px] border-2 border-slate-900"
      />
    </div>
  );
});
