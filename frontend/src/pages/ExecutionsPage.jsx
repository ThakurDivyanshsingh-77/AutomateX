import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { executionApi } from '../api/executionApi';
import {
  ArrowLeft,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Terminal,
  RefreshCw,
  Search
} from 'lucide-react';

export const ExecutionsPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await executionApi.getExecutionLogs();
      setLogs(data || []);
      if (data && data.length > 0) setSelectedLog(data[0]);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.workflow?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.triggerType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Header Navbar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h1 className="text-sm font-bold text-white">Workflow Execution Monitoring & Debugger</h1>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1.5 font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
        </button>
      </header>

      {/* Main Content Body - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Logs List */}
        <div className="w-1/3 min-w-[340px] max-w-[420px] bg-slate-900 border-r border-slate-800 flex flex-col h-full">
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-800/60">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading execution logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No execution logs recorded yet.</div>
            ) : (
              filteredLogs.map((log) => {
                const isSelected = selectedLog?._id === log._id;
                return (
                  <div
                    key={log._id}
                    onClick={() => setSelectedLog(log)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected ? 'bg-slate-800/80 border-l-2 border-brand-500' : 'hover:bg-slate-850'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {log.status === 'SUCCESS' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <h4 className="text-xs font-semibold text-slate-200 truncate">
                          {log.workflow?.name || 'Automation Workflow'}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span className="uppercase px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                          {log.triggerType}
                        </span>
                        <span>{new Date(log.createdAt || log.startTime).toLocaleTimeString()}</span>
                        <span>{log.durationMs}ms</span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Log Inspector Panel */}
        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto custom-scrollbar">
          {selectedLog ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Log Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
                      Execution ID: {selectedLog._id}
                    </span>
                    <h2 className="text-lg font-bold text-white mt-0.5">
                      {selectedLog.workflow?.name || 'Workflow Execution Details'}
                    </h2>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                      selectedLog.status === 'SUCCESS'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {selectedLog.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">TRIGGER TYPE</span>
                    <span className="text-slate-200">{selectedLog.triggerType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">TOTAL DURATION</span>
                    <span className="text-slate-200">{selectedLog.durationMs} ms</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">TIMESTAMP</span>
                    <span className="text-slate-200">
                      {new Date(selectedLog.startTime).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Box if Failed */}
              {selectedLog.errorDetails && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-rose-300 text-xs font-mono">
                  <strong className="block text-rose-400 mb-1">Execution Failure Stack:</strong>
                  {selectedLog.errorDetails}
                </div>
              )}

              {/* Step Results Trace */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Node Step Trace ({selectedLog.stepResults?.length || 0})
                </h3>

                {selectedLog.stepResults?.map((step, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-semibold text-white">{step.label}</h4>
                        <span className="text-[10px] font-mono text-slate-500">({step.nodeType})</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-medium">
                        {step.durationMs}ms
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Input Context Data</span>
                        <pre className="p-3 bg-slate-950 rounded-lg text-slate-300 font-mono text-[10px] overflow-x-auto border border-slate-800/80">
                          {JSON.stringify(step.inputData, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Output Step Payload</span>
                        <pre className="p-3 bg-slate-950 rounded-lg text-emerald-400 font-mono text-[10px] overflow-x-auto border border-slate-800/80">
                          {JSON.stringify(step.outputData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Select an execution log on the left to inspect step details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
