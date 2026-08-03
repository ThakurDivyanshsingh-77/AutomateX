import React, { useState, useEffect } from 'react';
import {
  X,
  GitCompare,
  Plus,
  Minus,
  Circle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { versionService } from '../services/versionService';
import toast from 'react-hot-toast';

const NodeDiffCard = ({ node, type }) => {
  const label = node?.data?.label || node?.data?.name || node?.type || node?.id;
  const colorMap = {
    added: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    removed: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    updated: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    unchanged: 'bg-slate-800/60 border-slate-700 text-slate-400',
  };
  const prefixMap = { added: '+', removed: '-', updated: '*', unchanged: ' ' };

  return (
    <div className={`px-3 py-2 rounded-lg border text-[11px] font-semibold flex items-center gap-2 ${colorMap[type]}`}>
      <span className="font-mono font-bold opacity-80">{prefixMap[type]}</span>
      <span>{label}</span>
      <span className="ml-auto text-[10px] opacity-60 font-mono">{node?.type}</span>
    </div>
  );
};

const NodeUpdatedCard = ({ item }) => {
  const { node, changes } = item;
  const label = node?.data?.label || node?.data?.name || node?.type || node?.id;

  return (
    <div className="px-3 py-2 rounded-lg border border-amber-500/30 bg-amber-500/5">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono font-bold text-amber-400 text-[10px]">*</span>
        <span className="text-[11px] font-semibold text-amber-300">{label}</span>
        <span className="ml-auto text-[10px] text-slate-500 font-mono">{node?.type}</span>
      </div>
      {changes.map((c, i) => (
        <p key={i} className="text-[10px] text-amber-400/70 pl-4">↳ {c}</p>
      ))}
    </div>
  );
};

export const CompareVersionsModal = ({ workflowId, versionA, versionB, onClose }) => {
  const [diff, setDiff] = useState(null);
  const [verAMeta, setVerAMeta] = useState(null);
  const [verBMeta, setVerBMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await versionService.compareVersions(workflowId, versionA, versionB);
        setDiff(res.diff);
        setVerAMeta(res.versionA);
        setVerBMeta(res.versionB);
      } catch (err) {
        toast.error('Failed to compare versions');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workflowId, versionA, versionB]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/20">
              <GitCompare className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Version Comparison</h2>
              {verAMeta && verBMeta && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-mono text-slate-400">{verAMeta.version}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-[11px] font-mono text-slate-200 font-bold">{verBMeta.version}</span>
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              Computing diff between versions...
            </div>
          </div>
        ) : diff ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
            {/* Version Meta Headers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mb-1">Older Version (A)</div>
                <div className="font-mono font-bold text-slate-200 text-sm">{verAMeta?.version}</div>
                <div className="text-[10px] text-slate-500">{verAMeta?.title}</div>
                <div className="text-[10px] text-slate-600">{verAMeta?.publishedAt ? new Date(verAMeta.publishedAt).toLocaleDateString() : ''}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/25">
                <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mb-1">Newer Version (B)</div>
                <div className="font-mono font-bold text-indigo-300 text-sm">{verBMeta?.version}</div>
                <div className="text-[10px] text-slate-400">{verBMeta?.title}</div>
                <div className="text-[10px] text-slate-600">{verBMeta?.publishedAt ? new Date(verBMeta.publishedAt).toLocaleDateString() : ''}</div>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { label: 'Added', value: diff.stats?.nodesAdded, color: 'text-emerald-400' },
                { label: 'Removed', value: diff.stats?.nodesRemoved, color: 'text-rose-400' },
                { label: 'Updated', value: diff.stats?.nodesUpdated, color: 'text-amber-400' },
                { label: 'Connections +', value: diff.stats?.edgesAdded, color: 'text-indigo-400' },
                { label: 'Connections -', value: diff.stats?.edgesRemoved, color: 'text-slate-400' },
              ].map((stat) => (
                <div key={stat.label} className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <div className={`text-lg font-extrabold font-mono ${stat.color}`}>{stat.value || 0}</div>
                  <div className="text-[9px] text-slate-500 font-semibold uppercase">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Human-readable Summary */}
            {diff.summary && diff.summary.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Change Summary</h4>
                <ul className="space-y-1">
                  {diff.summary.map((line, i) => (
                    <li key={i} className={`text-[11px] font-mono ${
                      line.startsWith('+') ? 'text-emerald-400'
                      : line.startsWith('-') ? 'text-rose-400'
                      : line.startsWith('*') ? 'text-amber-400'
                      : 'text-slate-400'
                    }`}>{line}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Node Diffs */}
            <div className="space-y-3">
              {diff.nodes.added.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3 h-3" /> Added Nodes ({diff.nodes.added.length})
                  </h4>
                  {diff.nodes.added.map((node) => <NodeDiffCard key={node.id} node={node} type="added" />)}
                </div>
              )}

              {diff.nodes.removed.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Minus className="w-3 h-3" /> Removed Nodes ({diff.nodes.removed.length})
                  </h4>
                  {diff.nodes.removed.map((node) => <NodeDiffCard key={node.id} node={node} type="removed" />)}
                </div>
              )}

              {diff.nodes.updated.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Updated Nodes ({diff.nodes.updated.length})</h4>
                  {diff.nodes.updated.map((item, i) => <NodeUpdatedCard key={i} item={item} />)}
                </div>
              )}

              {diff.edges.added.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Added Connections</h4>
                  {diff.edges.added.map((e, i) => (
                    <div key={i} className="text-[10px] font-mono text-indigo-300 px-3 py-1.5 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                      + {e.source} → {e.target}
                    </div>
                  ))}
                </div>
              )}

              {diff.edges.removed.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Removed Connections</h4>
                  {diff.edges.removed.map((e, i) => (
                    <div key={i} className="text-[10px] font-mono text-rose-300 px-3 py-1.5 rounded-lg bg-rose-500/5 border border-rose-500/20">
                      - {e.source} → {e.target}
                    </div>
                  ))}
                </div>
              )}

              {!diff.hasChanges && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No structural changes detected between these two versions.
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
