import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { gmailValidator } from './validators/gmailValidator';
import { NodeNotesAction } from './components/NodeNotesAction';

export const GmailNode = ({ id, data, selected }) => {
  const config = data?.config || {};
  const validation = gmailValidator(config);

  return (
    <div
      className={`min-w-[240px] bg-white border border-t-[3px] border-t-red-500 rounded-2xl p-3.5 shadow-md transition-all font-sans select-none relative ${
        selected ? 'border-red-500 ring-2 ring-red-500/25 shadow-red-500/15' : 'border-slate-200 hover:border-red-300'
      }`}
    >
      {/* Target Input Connection Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-white hover:!bg-red-600 transition-colors"
      />

      {/* Node Card Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              {data.label || 'Gmail'}
            </h3>
            <span className="text-[9px] font-mono font-bold tracking-tight uppercase px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200">
              EMAIL • {config.operation || 'sendEmail'}
            </span>
          </div>
        </div>

        {/* Validation Status Badge & Notes Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!validation.isValid ? (
            <AlertCircle className="w-4 h-4 text-amber-500" title={validation.errors.join(', ')} />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <NodeNotesAction nodeId={id} note={data?.note} />
        </div>
      </div>

      {/* Node Details Preview */}
      <div className="space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200 font-mono text-[10px]">
        <div className="flex items-center justify-between text-slate-600">
          <span>To:</span>
          <span className="text-slate-800 truncate max-w-[130px] font-bold">
            {config.to || 'Not configured'}
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Subject:</span>
          <span className="text-slate-700 truncate max-w-[130px]">
            {config.subject || 'Empty'}
          </span>
        </div>
      </div>

      {/* Source Output Connection Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-white hover:!bg-red-600 transition-colors"
      />
    </div>
  );
};

export default GmailNode;
