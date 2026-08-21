import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Webhook, ShieldCheck, ShieldAlert, Globe } from 'lucide-react';

export const WebhookNode = ({ data, selected }) => {
  const config = data?.config || {};
  const method = (config.method || 'ANY').toUpperCase();
  const authType = config.authType || 'none';
  const path = config.path || 'user-signup';

  return (
    <div
      className={`min-w-[240px] bg-white border rounded-2xl p-3.5 shadow-md transition-all font-sans select-none relative ${
        selected
          ? 'border-brand-500 ring-2 ring-brand-500/25 shadow-brand-500/15'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
            <Webhook className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              {data.label || 'Webhook Trigger'}
            </h3>
            <span className="text-[10px] font-mono text-blue-700 uppercase block">
              TRIGGER / PUBLIC HTTP
            </span>
          </div>
        </div>

        {/* Auth status icon */}
        {authType === 'none' ? (
          <Globe className="w-4 h-4 text-emerald-600" title="Public Endpoint" />
        ) : (
          <ShieldCheck className="w-4 h-4 text-blue-600" title={`Auth: ${authType}`} />
        )}
      </div>

      {/* Endpoint summary badge */}
      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[10px] flex items-center justify-between gap-2">
        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
          {method}
        </span>
        <span className="text-slate-600 truncate flex-1 text-right font-medium">
          /api/v1/webhooks/{path}
        </span>
      </div>

      {/* Output Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white hover:!bg-blue-600 transition-colors"
      />
    </div>
  );
};

