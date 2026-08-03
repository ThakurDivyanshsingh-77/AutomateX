import React, { useState, useEffect } from 'react';
import { X, Download, RotateCcw, Activity, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { ExecutionTimeline } from './ExecutionTimeline';
import { ExecutionInspector } from './ExecutionInspector';
import { ExecutionReplay } from './ExecutionReplay';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const ExecutionDebugger = ({ isOpen, onClose, executionId }) => {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStepIndex, setSelectedStepIndex] = useState(1);

  useEffect(() => {
    if (isOpen && executionId) {
      fetchDebugSnapshot(executionId);
    }
  }, [isOpen, executionId]);

  const fetchDebugSnapshot = async (execId) => {
    setLoading(true);
    try {
      const res = await api.get(`/executions/${execId}/debug`);
      setSnapshot(res.data?.snapshot || null);
      setSelectedStepIndex(1);
    } catch (err) {
      toast.error('Failed to load execution debug snapshot');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (!snapshot) return;
    const jsonStr = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution_debug_${executionId || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported execution debug JSON');
  };

  if (!isOpen) return null;

  const metadata = snapshot?.metadata || {};
  const timeline = snapshot?.timeline || [];
  const metrics = snapshot?.metrics || {};
  const selectedStep = timeline.find((s) => s.stepIndex === selectedStepIndex) || timeline[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[85vh]">
        {/* Debugger Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100">
                  {metadata.workflowName || 'Execution Inspector & Debugger'}
                </h2>
                {metadata.status === 'success' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    SUCCESS
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {metadata.status || 'RUNNING'}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                ID: {metadata.executionId || executionId} • Duration: {metadata.durationMs || 0}ms • {metadata.nodesExecutedCount || 0} Nodes Executed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJSON}
              className="p-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>

            <ExecutionReplay
              executionId={executionId}
              onReplaySuccess={() => fetchDebugSnapshot(executionId)}
            />

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Debugger Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Timeline */}
          <div className="w-64 bg-slate-950/60 border-r border-slate-800 overflow-y-auto">
            <ExecutionTimeline
              timeline={timeline}
              selectedStepIndex={selectedStepIndex}
              onSelectStep={setSelectedStepIndex}
            />
          </div>

          {/* Right Inspector Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/40">
            <ExecutionInspector stepData={selectedStep} metrics={metrics} />
          </div>
        </div>
      </div>
    </div>
  );
};
