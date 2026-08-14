import React from 'react';
import { Repeat, Sliders, CheckCircle2, Terminal } from 'lucide-react';

export const ForEachTournamentProperties = ({
  node,
  nodeData,
  onUpdateNodeData,
  onUpdateConfig,
  workflowNodes = [],
  executionSnapshot = {},
}) => {
  const config = node?.data?.config || nodeData?.config || {};
  const tournamentsExpr = config.tournaments ?? '{{steps["Gemini → Structure Tournament"].tournaments}}';

  const handleChange = (key, value) => {
    const nextConfig = { ...config, [key]: value };
    if (onUpdateConfig) {
      onUpdateConfig(nextConfig);
    } else if (onUpdateNodeData && node) {
      onUpdateNodeData(node.id, {
        ...(node.data || {}),
        config: nextConfig,
      });
    }
  };

  return (
    <div className="space-y-6 text-xs text-slate-300 p-1">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
          <Repeat className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-cyan-300">For Each Tournament</h4>
          <p className="text-[11px] text-cyan-400/80">
            Iterates over extracted tournaments or a single tournament item
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Tournaments Source Collection
          </label>
          <span className="text-[10px] text-cyan-400 font-mono">Array / Object</span>
        </div>
        <input
          type="text"
          value={tournamentsExpr}
          onChange={(e) => handleChange('tournaments', e.target.value)}
          placeholder='{{steps["Gemini → Structure Tournament"].tournaments}}'
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-[11px] text-slate-200 focus:border-cyan-500 focus:outline-none"
        />
        <p className="text-[10px] text-slate-400">
          Accepts an array of tournaments, a single tournament object, or an upstream expression.
        </p>
      </div>

      {/* Exposed Variables Card */}
      <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[11px]">
          <Terminal className="w-4 h-4" /> Downstream Variables
        </div>
        <div className="space-y-1 font-mono text-[10px]">
          <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-300">{"{{currentTournament}}"}</span>
            <span className="text-slate-500">Active tournament object</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-300">{"{{currentItem}}"}</span>
            <span className="text-slate-500">Alias for current tournament</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-300">{"{{currentIndex}}"}</span>
            <span className="text-slate-500">Zero-based index</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-300">{"{{totalItems}}"}</span>
            <span className="text-slate-500">Total tournament count</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForEachTournamentProperties;
