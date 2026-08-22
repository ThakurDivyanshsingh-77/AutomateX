import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Clock, FileSpreadsheet } from 'lucide-react';
import { NodeNotesAction } from '../components/NodeNotesAction';

export const GoogleSheetsTriggerNode = ({ id, data, selected }) => {
  const config = data?.config || {};
  const triggerEvent = config.triggerEvent || 'newRow';
  const worksheetTitle = config.worksheetTitle || config.worksheet || 'Sheet1';
  const pollingInterval = config.pollingInterval || '30s';

  const eventLabel =
    triggerEvent === 'newRow'
      ? 'New Row Added'
      : triggerEvent === 'updatedRow'
      ? 'Row Updated'
      : 'Any Change';

  return (
    <div
      className={`min-w-[240px] bg-white border border-t-[3px] border-t-emerald-600 rounded-2xl p-3.5 shadow-md transition-all font-sans select-none relative ${
        selected
          ? 'border-emerald-600 ring-2 ring-emerald-600/25 shadow-emerald-600/15'
          : 'border-slate-200 hover:border-emerald-400'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              {data.label || 'Google Sheets Trigger'}
            </h3>
            <span className="text-[9px] font-mono font-bold tracking-tight uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 block">
              GOOGLE SHEETS • POLLING
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200">
            LIVE
          </span>
          <NodeNotesAction nodeId={id} note={data?.note} />
        </div>
      </div>

      {/* Configuration Summary Badge */}
      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[10px] space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 flex items-center gap-1 font-medium">
            <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
            {worksheetTitle}
          </span>
          <span className="text-emerald-700 font-bold">{eventLabel}</span>
        </div>
        <div className="flex items-center justify-between text-[9px] text-slate-500 pt-0.5 border-t border-slate-200">
          <span className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            Interval
          </span>
          <span className="font-bold text-slate-700">{pollingInterval}</span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-emerald-600 !w-3 !h-3 !border-2 !border-white hover:!bg-emerald-700 transition-colors"
      />
    </div>
  );
};

export default GoogleSheetsTriggerNode;
