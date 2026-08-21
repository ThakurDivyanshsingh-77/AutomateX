import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileOutput, AlertTriangle } from 'lucide-react';
import { pdfGeneratorManifest } from './pdfGeneratorManifest';
import { NodeNotesAction } from '../components/NodeNotesAction';

export const PdfGeneratorNode = memo(({ id, data, selected }) => {
  const config = data?.config || {};
  const validation = pdfGeneratorManifest.validate(config);
  const isInvalid = !validation.isValid;

  return (
    <div
      className={`min-w-[240px] max-w-[300px] rounded-xl bg-white border transition-all duration-200 shadow-md ${
        isInvalid
          ? 'border-amber-400 ring-2 ring-amber-400/30'
          : selected
          ? 'border-brand-500 ring-2 ring-brand-500/25 shadow-brand-500/15'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-violet-500 !w-3 !h-3 !-left-[7px] border-2 border-white"
      />

      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg border bg-violet-50 text-violet-600 border-violet-200">
            <FileOutput className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'PDF Generator'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              OUTPUT
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isInvalid && (
            <AlertTriangle
              className="w-4 h-4 text-amber-500 flex-shrink-0"
              title={Object.values(validation.errors).join(', ')}
            />
          )}
          <NodeNotesAction nodeId={id} note={data?.note} />
        </div>
      </div>


      <div className="p-3 text-[11px] text-slate-600 bg-slate-50/70 rounded-b-xl space-y-1">
        <div className="flex items-center justify-between font-mono text-[10px]">
          <span className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 font-bold capitalize">
            {config.template || 'blank'}
          </span>
          <span className="truncate text-slate-700 max-w-[130px] font-medium">
            {config.fileName || 'document.pdf'}
          </span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-violet-500 !w-3 !h-3 !-right-[7px] border-2 border-white"
      />
    </div>
  );
});

