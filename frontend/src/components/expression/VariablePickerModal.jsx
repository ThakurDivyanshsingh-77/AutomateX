import React, { useState } from 'react';
import { X, Layers, Database, Sparkles, Command } from 'lucide-react';
import { VariableSearch } from './VariableSearch';
import { VariableTree } from './VariableTree';
import { VariablePreview } from './VariablePreview';
import { NODE_REGISTRY } from '../../features/workflow/nodes/registry/nodeRegistry';

// Rich Sample Output Schema defaults for nodes before execution
const SAMPLE_NODE_OUTPUTS = {
  start: {
    triggeredAt: '2026-07-30T10:00:00.000Z',
    triggerType: 'manual',
    source: 'user_initiator',
  },
  http: {
    statusCode: 200,
    statusText: 'OK',
    data: {
      id: 101,
      name: 'Divyansh',
      email: 'divyansh@example.com',
      user: {
        address: {
          city: 'Jaipur',
          zipcode: '302001',
        },
      },
      items: [
        { id: 1, name: 'Laptop', price: 1200 },
        { id: 2, name: 'Mouse', price: 40 },
      ],
    },
  },
  gmail: {
    provider: 'gmail',
    messageId: '18ab4d8d90ef',
    threadId: '18ab4d8d90ef',
    status: 'SENT',
    recipient: 'recipient@example.com',
    subject: 'Order Confirmation',
  },
  condition: {
    result: true,
    selectedBranch: 'true',
    leftResolved: 200,
    operator: 'equals',
    rightResolved: 200,
  },
  log: {
    message: 'Workflow log payload output',
    loggedAt: '2026-07-30T10:00:00.000Z',
  },
  delay: {
    delayedSeconds: 5,
    status: 'completed',
  },
  end: {
    completed: true,
    finishedAt: '2026-07-30T10:00:00.000Z',
  },
};

export const VariablePickerModal = ({ isOpen, onClose, onInsert, workflowNodes = [] }) => {
  if (!isOpen) return null;

  // Build available nodes list from active canvas nodes or default registry
  const availableNodes = workflowNodes.length > 0
    ? workflowNodes.map((n) => ({
        id: n.id,
        type: n.type,
        label: n.data?.label || n.type,
        outputData: SAMPLE_NODE_OUTPUTS[n.type] || { status: 'success' },
      }))
    : Object.entries(NODE_REGISTRY).map(([type, def]) => ({
        id: type,
        type: type,
        label: def.label,
        outputData: SAMPLE_NODE_OUTPUTS[type] || { status: 'success' },
      }));

  const [selectedNodeId, setSelectedNodeId] = useState(availableNodes[0]?.id || 'http');
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedSampleValue, setSelectedSampleValue] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const activeNode = availableNodes.find((n) => n.id === selectedNodeId) || availableNodes[0];

  const handleSelectPath = (path, sampleVal) => {
    setSelectedPath(path);
    setSelectedSampleValue(sampleVal);
  };

  const handleDoubleClickPath = (path) => {
    const expr = `{{${path}}}`;
    onInsert(expr);
    onClose();
  };

  const handleInsertClick = (expr) => {
    onInsert(expr);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Variable Picker & Data Explorer
              </h2>
              <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                <span>Browse previous node outputs. Tip: Press</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-sans font-semibold">
                  Ctrl + Space
                </kbd>
                <span>or double-click to insert.</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 flex overflow-hidden min-h-[360px]">
          {/* Left Panel: Available Workflow Nodes */}
          <div className="w-56 bg-slate-950/60 border-r border-slate-800 p-3 space-y-1.5 overflow-y-auto">
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
              Executed Nodes
            </h4>

            {availableNodes.map((node) => {
              const regEntry = NODE_REGISTRY[node.type] || {};
              const Icon = regEntry.icon || Database;
              const isSelected = node.id === selectedNodeId;

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    setSelectedPath('');
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-200 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg border ${regEntry.badgeColor || 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <h5 className="text-xs font-bold text-slate-200 truncate">{node.label}</h5>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">{node.type}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Panel: Variable Tree Explorer */}
          <div className="flex-1 flex flex-col p-4 space-y-3 overflow-hidden bg-slate-900/40">
            {/* Search Bar */}
            <VariableSearch value={searchTerm} onChange={setSearchTerm} />

            {/* Tree Container */}
            <div className="flex-1 overflow-y-auto bg-slate-950/60 rounded-xl border border-slate-800/80 p-2">
              <VariableTree
                data={activeNode?.outputData}
                rootPrefix={activeNode?.type}
                selectedPath={selectedPath}
                onSelectPath={handleSelectPath}
                onDoubleClickPath={handleDoubleClickPath}
                searchTerm={searchTerm}
              />
            </div>
          </div>
        </div>

        {/* Footer Preview & Actions */}
        <VariablePreview
          selectedPath={selectedPath}
          sampleValue={selectedSampleValue}
          onInsert={handleInsertClick}
        />
      </div>
    </div>
  );
};
