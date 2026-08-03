import React, { useState } from 'react';
import { NodeInspector } from './NodeInspector';
import { ExpressionInspector } from './ExpressionInspector';
import { PerformancePanel } from './PerformancePanel';
import { Info, Code, Sparkles, Activity, CheckCircle2, AlertTriangle, ShieldCheck, Mail, GitBranch, Webhook } from 'lucide-react';

export const ExecutionInspector = ({ stepData, metrics }) => {
  const [activeTab, setActiveTab] = useState('summary');

  if (!stepData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono text-xs">
        <Info className="w-8 h-8 text-slate-600 mb-2" />
        <p>Select any step from the execution timeline to inspect inputs, outputs, expressions, and performance.</p>
      </div>
    );
  }

  const {
    nodeId,
    nodeName,
    nodeType = '',
    status,
    durationMs,
    timestamp,
    rawInput,
    output,
    httpDetails,
    gmailDetails,
    webhookDetails,
    conditionDetails,
    expressions = [],
    error,
  } = stepData;

  return (
    <div className="flex-1 flex flex-col overflow-hidden font-sans select-none bg-slate-900/60">
      {/* Step Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100">{nodeName || nodeType}</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
              {nodeType}
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-0.5">
            Node ID: {nodeId} • Executed in {durationMs}ms
          </p>
        </div>

        <div>
          {status === 'success' ? (
            <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Success
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {status || 'Failed'}
            </span>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 p-2 px-4 border-b border-slate-800 bg-slate-950/80 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'summary'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Info className="w-3.5 h-3.5" /> Summary
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inputs')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'inputs'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Code className="w-3.5 h-3.5" /> Inputs & Config
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('outputs')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'outputs'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Code className="w-3.5 h-3.5" /> Output Data
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expressions')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'expressions'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Expressions ({expressions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'metrics'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-indigo-400" /> Metrics
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* Condition Evaluation Banner */}
            {conditionDetails && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <GitBranch className="w-4 h-4" />
                  <span>Condition Branch Evaluated</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div>Left Value: <span className="text-amber-300 font-bold">{String(conditionDetails.leftResolved)}</span></div>
                  <div>Right Value: <span className="text-amber-300 font-bold">{String(conditionDetails.rightResolved)}</span></div>
                  <div>Operator: <span className="text-slate-200">{conditionDetails.operator}</span></div>
                  <div>Chosen Branch: <span className={conditionDetails.result ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{conditionDetails.selectedBranch.toUpperCase()}</span></div>
                </div>
              </div>
            )}

            {/* Gmail Details Banner */}
            {gmailDetails && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <Mail className="w-4 h-4" />
                  <span>Gmail Dispatch Details</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div>Recipient: <span className="text-slate-100 font-bold">{gmailDetails.recipient}</span></div>
                  <div>Subject: <span className="text-slate-100 font-bold">{gmailDetails.subject}</span></div>
                  <div>Google Message ID: <span className="text-slate-400">{gmailDetails.messageId || 'gmail_mock_id'}</span></div>
                </div>
              </div>
            )}

            {/* Webhook Details Banner */}
            {webhookDetails && (
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <Webhook className="w-4 h-4" />
                  <span>Incoming Webhook Request</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div>Method: <span className="text-blue-300 font-bold">{webhookDetails.method}</span></div>
                  <div>Requester IP: <span className="text-slate-400">{webhookDetails.requesterIp}</span></div>
                  <div>Timestamp: <span className="text-slate-400">{webhookDetails.timestamp}</span></div>
                </div>
              </div>
            )}

            <NodeInspector title="Input Configuration" data={rawInput} />
            <NodeInspector title="Execution Output Payload" data={output} />
          </div>
        )}

        {activeTab === 'inputs' && <NodeInspector title="Raw Input Received" data={rawInput} />}

        {activeTab === 'outputs' && <NodeInspector title="Returned Output Data" data={output} />}

        {activeTab === 'expressions' && <ExpressionInspector expressions={expressions} />}

        {activeTab === 'metrics' && <PerformancePanel metrics={metrics} />}
      </div>
    </div>
  );
};
