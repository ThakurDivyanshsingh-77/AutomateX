import React, { useState } from 'react';
import { Repeat, Info, Layers } from 'lucide-react';

export const ForEachProductProperties = ({
  node,
  nodeData,
  onUpdateNodeData,
  onUpdateConfig,
}) => {
  const config = node?.data?.config || nodeData?.config || {};

  const updateConfig = (newConfig) => {
    if (onUpdateNodeData && node?.id) {
      onUpdateNodeData(node.id, { config: newConfig });
    } else if (onUpdateConfig) {
      onUpdateConfig(newConfig);
    }
  };

  const [productsExpr, setProductsExpr] = useState(
    config.products || '{{steps["Gemini → Structure Products"].products}}'
  );
  const [itemVariable, setItemVariable] = useState(config.itemVariable || 'currentItem');
  const [indexVariable, setIndexVariable] = useState(config.indexVariable || 'currentIndex');

  const handleChange = (key, value) => {
    if (key === 'products') setProductsExpr(value);
    if (key === 'itemVariable') setItemVariable(value);
    if (key === 'indexVariable') setIndexVariable(value);

    updateConfig({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4 text-slate-200">
      <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-start gap-2.5">
        <Repeat className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-semibold text-amber-300">Sequential Loop Controller</p>
          <p className="text-[11px] text-amber-200/70 mt-0.5">
            Iterates through an array of structured products one by one, exposing each item into the workflow context.
          </p>
        </div>
      </div>

      {/* Input Array Expression */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-300">Products Array Expression *</label>
        <textarea
          rows={2}
          value={productsExpr}
          onChange={(e) => handleChange('products', e.target.value)}
          placeholder='{{steps["Gemini → Structure Products"].products}}'
          className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md p-2.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Context Variable Names */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Item Variable Name</label>
          <input
            type="text"
            value={itemVariable}
            onChange={(e) => handleChange('itemVariable', e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Index Variable Name</label>
          <input
            type="text"
            value={indexVariable}
            onChange={(e) => handleChange('indexVariable', e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Variable Explorer helper */}
      <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg space-y-1.5 text-xs">
        <p className="font-semibold text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          Exposed Variables for Loop Steps
        </p>
        <div className="space-y-1 font-mono text-[10px] text-amber-300">
          <div>• <code>{'{{steps["For Each Product"].currentItem}}'}</code> (Current product object)</div>
          <div>• <code>{'{{steps["For Each Product"].currentIndex}}'}</code> (Current index: 0, 1, 2...)</div>
          <div>• <code>{'{{steps["For Each Product"].totalItems}}'}</code> (Total count)</div>
        </div>
      </div>
    </div>
  );
};
