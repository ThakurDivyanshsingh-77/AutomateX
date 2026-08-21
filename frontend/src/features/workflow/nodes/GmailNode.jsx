import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { gmailValidator } from './validators/gmailValidator';

export const GmailNode = ({ data, selected }) => {
  const config = data?.config || {};
  const validation = gmailValidator(config);

  return (
    <div
      className={`min-w-[240px] bg-white border rounded-2xl p-3.5 shadow-md transition-all font-sans select-none relative ${
        selected ? 'border-brand-500 ring-2 ring-brand-500/25 shadow-brand-500/15' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Target Input Connection Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-slate-300 !w-3 !h-3 !border-2 !border-white hover:!bg-red-500 transition-colors"
      />

      {/* Node Card Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              {data.label || 'Gmail'}
            </h3>
            <span className="text-[10px] font-mono text-slate-500 capitalize block">
              {config.operation || 'sendEmail'}
            </span>
          </div>
        </div>

        {/* Validation Status Badge */}
        {!validation.isValid ? (
          <AlertCircle className="w-4 h-4 text-amber-500" title={validation.errors.join(', ')} />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        )}
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

