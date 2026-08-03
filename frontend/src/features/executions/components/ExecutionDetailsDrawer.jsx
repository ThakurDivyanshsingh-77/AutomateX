import React, { useState } from 'react';
import {
  X,
  Play,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
  Activity,
  Layers,
  ArrowRight,
  Copy,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ExecutionDetailsDrawer = ({ execution, onClose, onReplay }) => {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [replaying, setReplaying] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'data' | 'raw'

  if (!execution) return null;

  const logs = execution.stepDetails || execution.logs || [];
  const selectedStep = logs.find((l) => l.nodeId === selectedNodeId) || logs[0];

  const handleReplay = async () => {
    setReplaying(true);
    try {
      await onReplay(execution._id);
    } catch (err) {
      toast.error('Failed to replay execution');
    } finally {
      setReplaying(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(execution, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `execution_${execution._id || 'log'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Execution log downloaded as JSON!');
  };

  const handleExportCSV = () => {
    const headers = ['Node ID', 'Node Name', 'Node Type', 'Status', 'Duration (ms)', 'Timestamp'];
    const rows = logs.map((l) => [
      l.nodeId,
      `"${l.nodeName || ''}"`,
      l.nodeType,
      l.status,
      l.duration || 0,
      `"${new Date(l.timestamp || l.startedAt).toISOString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `execution_${execution._id || 'log'}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Execution trace downloaded as CSV!');
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'success' || s === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> Success
        </span>
      );
    }
    if (s === 'failed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertCircle className="w-3.5 h-3.5" /> Failed
        </span>
      );
    }
    if (s === 'running' || s === 'queued' || s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
        {status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-3xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">
                  {execution.workflowName || execution.workflow?.name || 'Execution Run Inspector'}
                </h3>
                {getStatusBadge(execution.status)}
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                ID: {execution._id} • Trigger: <span className="uppercase text-slate-400">{execution.triggerType || 'manual'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReplay}
              disabled={replaying}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {replaying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>Replay Execution</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Overview Bar */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-slate-950 border-b border-slate-800/80 text-xs font-sans">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Duration</span>
            <div className="text-xs font-bold text-slate-200 font-mono mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> {execution.duration || 0} ms
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Nodes Executed</span>
            <div className="text-xs font-bold text-slate-200 font-mono mt-0.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-400" /> {logs.length || execution.nodesExecuted || 0} Nodes
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Started At</span>
            <div className="text-[11px] font-medium text-slate-300 font-mono mt-0.5 truncate">
              {new Date(execution.startedAt || execution.createdAt).toLocaleTimeString()}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Export Logs</span>
            <div className="flex gap-1 mt-1">
              <button
                onClick={handleExportJSON}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold flex items-center gap-1 border border-slate-700"
              >
                <Download className="w-2.5 h-2.5" /> JSON
              </button>
              <button
                onClick={handleExportCSV}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold flex items-center gap-1 border border-slate-700"
              >
                <Download className="w-2.5 h-2.5" /> CSV
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-4">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Timeline Trace
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'data'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Node Input & Output
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'raw'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Raw Log Payload
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950">
          {/* TAB 1: Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Execution Timeline Trace ({logs.length} Steps)
              </h4>

              <div className="space-y-2">
                {logs.map((step, idx) => {
                  const isSelected = selectedStep?.nodeId === step.nodeId;
                  const isSuccess = step.status === 'success' || step.status === 'completed';
                  const isFailed = step.status === 'failed';

                  return (
                    <div
                      key={step.nodeId || idx}
                      onClick={() => {
                        setSelectedNodeId(step.nodeId);
                        setActiveTab('data');
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                        isSelected
                          ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full font-mono text-[10px] font-bold flex items-center justify-center ${
                              isSuccess
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isFailed
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {idx + 1}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-200">
                                {step.nodeName || step.nodeId}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                                {step.nodeType}
                              </span>
                              {step.status === 'recovered' && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                  RECOVERED
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(step.timestamp || step.startedAt || Date.now()).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono text-slate-400">{step.duration || 0}ms</span>
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        </div>
                      </div>

                      {/* Phase 11: Retry Attempt Timeline */}
                      {Array.isArray(step.retryAttempts) && step.retryAttempts.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                          <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Attempts:</span>
                          {step.retryAttempts.map((attempt, aIdx) => (
                            <div
                              key={aIdx}
                              className={`px-2 py-0.5 rounded text-[9px] font-mono flex items-center gap-1 border ${
                                attempt.status === 'success' || attempt.status === 'recovered'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : attempt.status === 'timeout'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}
                              title={attempt.error ? `Attempt #${attempt.attemptNumber}: ${attempt.error}` : `Attempt #${attempt.attemptNumber} succeeded`}
                            >
                              <span>#{attempt.attemptNumber}</span>
                              <span className="opacity-70 font-semibold">{attempt.durationMs}ms</span>
                              {attempt.status === 'timeout' && <span className="font-bold">⏰</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Node Data Inspector */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              {/* Step Node Selector Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {logs.map((s, i) => (
                  <button
                    key={s.nodeId || i}
                    onClick={() => setSelectedNodeId(s.nodeId)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      selectedStep?.nodeId === s.nodeId
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span>{i + 1}.</span>
                    <span>{s.nodeName || s.nodeId}</span>
                  </button>
                ))}
              </div>

              {selectedStep ? (
                <div className="space-y-3">
                  {/* Selected Node Summary Header */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{selectedStep.nodeName || selectedStep.nodeId}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Type: {selectedStep.nodeType} • Duration: {selectedStep.duration || 0}ms</p>
                    </div>
                    {getStatusBadge(selectedStep.status)}
                  </div>

                  {/* Error Stack Trace if failed */}
                  {selectedStep.error && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                        <AlertCircle className="w-4 h-4" /> Node Execution Error
                      </div>
                      <p className="text-xs font-mono font-semibold">{selectedStep.error.message || String(selectedStep.error)}</p>
                      {selectedStep.error.stack && (
                        <pre className="p-2 bg-slate-950 rounded text-[10px] text-rose-400/90 font-mono overflow-x-auto max-h-32 border border-rose-500/20">
                          {selectedStep.error.stack}
                        </pre>
                      )}
                    </div>
                  )}

                  {/* Input Data Section */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Input Payload</span>
                    <pre className="p-3 bg-slate-900 rounded-xl text-xs text-indigo-300 font-mono overflow-x-auto border border-slate-800 max-h-48">
                      {JSON.stringify(selectedStep.input || {}, null, 2)}
                    </pre>
                  </div>

                  {/* Output Data Section */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Output Result</span>
                    <pre className="p-3 bg-slate-900 rounded-xl text-xs text-emerald-400 font-mono overflow-x-auto border border-slate-800 max-h-60">
                      {JSON.stringify(selectedStep.output || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No step selected. Click a node step above to view details.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Raw Log JSON */}
          {activeTab === 'raw' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Complete Execution Document</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(execution, null, 2));
                    toast.success('Raw log payload copied to clipboard!');
                  }}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[10px] font-medium flex items-center gap-1 border border-slate-800"
                >
                  <Copy className="w-3 h-3" /> Copy JSON
                </button>
              </div>
              <pre className="p-4 bg-slate-900 rounded-xl text-xs text-slate-300 font-mono overflow-x-auto border border-slate-800 max-h-[500px]">
                {JSON.stringify(execution, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
