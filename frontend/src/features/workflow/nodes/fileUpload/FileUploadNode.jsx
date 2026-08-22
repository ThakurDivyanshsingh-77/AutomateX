import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { fileUploadManifest } from './fileUploadManifest';
import { NodeNotesAction } from '../components/NodeNotesAction';

export const FileUploadNode = memo(({ id, data, selected }) => {
  const config = data?.config || {};
  const validation = fileUploadManifest.validate(config);
  const isInvalid = !validation.isValid;

  const file = config.file;
  const fileName = file?.name || file?.originalName || (config.fileId ? `Document (${config.fileId})` : null);
  const fileExt = (file?.extension || '').replace('.', '').toUpperCase();
  const fileSizeStr = file?.size ? `${(file.size / 1024).toFixed(0)} KB` : '';

  const status = data?.executionStatus;

  return (
    <div
      className={`min-w-[240px] max-w-[300px] rounded-xl bg-white border border-t-[3px] border-t-sky-500 transition-all duration-200 shadow-md ${
        selected
          ? 'border-sky-500 ring-2 ring-sky-500/25 shadow-sky-500/15'
          : status === 'RUNNING'
          ? 'border-amber-500 animate-pulse ring-2 ring-amber-500/20'
          : status === 'SUCCESS'
          ? 'border-emerald-500 shadow-emerald-500/10'
          : status === 'FAILED'
          ? 'border-rose-500 ring-2 ring-rose-500/20'
          : isInvalid
          ? 'border-amber-400 ring-1 ring-amber-400/30'
          : 'border-slate-200 hover:border-sky-300'
      }`}
    >
      {/* Target Connection Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-sky-500 !w-3 !h-3 !-left-[7px] border-2 border-white"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-lg gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-sky-50 text-sky-600 border-sky-200 shrink-0">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'File → Upload Document'}
            </h4>
            <span className="text-[9px] font-mono font-bold tracking-tight uppercase px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
              DOCUMENT INPUT
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
      <div className="p-3 text-[11px] text-slate-600 bg-slate-50/70 rounded-b-xl space-y-1">
        {fileName ? (
          <div className="flex items-center justify-between font-mono text-[10px]">
            <div className="flex items-center gap-1.5 truncate max-w-[170px]">
              <FileText className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="truncate text-slate-800 font-medium">{fileName}</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-bold uppercase shrink-0">
              {fileExt || 'DOCX'} {fileSizeStr ? `• ${fileSizeStr}` : ''}
            </span>
          </div>
        ) : (
          <div className="text-slate-400 italic text-[11px] flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
            <span>Upload a document for processing...</span>
          </div>
        )}
      </div>

      {/* Source Connection Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-sky-500 !w-3 !h-3 !-right-[7px] border-2 border-white"
      />
    </div>
  );
});

export default FileUploadNode;
