import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { gmailValidator } from './validators/gmailValidator';

export const GmailNode = ({ data, selected }) => {
  const config = data?.config || {};
  const validation = gmailValidator(config);

  return (
    <div
      className={`min-w-[240px] bg-slate-900 border rounded-2xl p-3.5 shadow-2xl transition-all font-sans select-none relative ${
        selected ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Target Input Connection Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-slate-700 !w-3 !h-3 !border-2 !border-slate-900 hover:!bg-red-500 transition-colors"
      />

      {/* Node Card Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight">
              {data.label || 'Gmail'}
            </h3>
            <span className="text-[10px] font-mono text-slate-400 capitalize block">
              {config.operation || 'sendEmail'}
            </span>
          </div>
        </div>

        {/* Validation Status Badge */}
        {!validation.isValid ? (
          <AlertCircle className="w-4 h-4 text-amber-400" title={validation.errors.join(', ')} />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        )}
      </div>

      {/* Node Details Preview */}
      <div className="space-y-1 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 font-mono text-[10px]">
        <div className="flex items-center justify-between text-slate-400">
          <span>To:</span>
          <span className="text-slate-200 truncate max-w-[130px] font-bold">
            {config.to || 'Not configured'}
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Subject:</span>
          <span className="text-slate-300 truncate max-w-[130px]">
            {config.subject || 'Empty'}
          </span>
        </div>
      </div>

      {/* Source Output Connection Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-slate-900 hover:!bg-red-400 transition-colors"
      />
    </div>
  );
};
