import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Webhook, ShieldCheck, ShieldAlert, Globe } from 'lucide-react';
import { NodeNotesAction } from '../components/NodeNotesAction';

export const WebhookNode = ({ id, data, selected }) => {
  const config = data?.config || {};
  const method = (config.method || 'ANY').toUpperCase();
  const authType = config.authType || 'none';
  const path = config.path || 'user-signup';

  return (
    <div
      className={`min-w-[240px] bg-white border border-t-[3px] border-t-sky-500 rounded-2xl p-3.5 shadow-md transition-all font-sans select-none relative ${
        selected
          ? 'border-sky-500 ring-2 ring-sky-500/25 shadow-sky-500/15'
          : 'border-slate-200 hover:border-sky-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shrink-0">
            <Webhook className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              {data.label || 'Webhook Trigger'}
            </h3>
            <span className="text-[9px] font-mono font-bold tracking-tight uppercase px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200 block">
              TRIGGER • PUBLIC HTTP
            </span>
          </div>
        </div>

        {/* Auth status icon & Notes Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {authType === 'none' ? (
            <Globe className="w-4 h-4 text-emerald-600" title="Public Endpoint" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-sky-600" title={`Auth: ${authType}`} />
          )}
          <NodeNotesAction nodeId={id} note={data?.note} />
        </div>
      </div>

      {/* Endpoint summary badge */}
      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[10px] flex items-center justify-between gap-2">
        <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-bold border border-sky-200">
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
        className="!bg-sky-500 !w-3 !h-3 !border-2 !border-white hover:!bg-sky-600 transition-colors"
      />
    </div>
  );
};

export default WebhookNode;
