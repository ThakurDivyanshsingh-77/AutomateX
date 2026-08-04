import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Sparkles,
  ArrowRight,
  GripVertical,
  Trash2,
  CheckCircle2,
  Terminal,
  Zap,
  Layers,
  AlertTriangle,
  FileCode,
  Sliders,
  Activity,
  Code,
} from 'lucide-react';
import { VariableEngine } from '../../../engine/variable/VariableEngine';
import { JSONTreeExplorer } from '../../../components/expression/JSONTreeExplorer';

export const DataMapperPanel = ({
  isOpen,
  onClose,
  targetNode,
  workflowNodes = [],
  executionSnapshot = null,
  onUpdateTargetNodeConfig,
}) => {
  const [activeTab, setActiveTab] = useState('mapper'); // mapper | inspector | preview
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceNodeId, setSelectedSourceNodeId] = useState('');
  const [hoveredVariable, setHoveredVariable] = useState(null);

  // Discover all workflow nodes & schemas
  const data = useMemo(() => {
    return VariableEngine.list(workflowNodes, executionSnapshot);
  }, [workflowNodes, executionSnapshot]);

  // Source nodes available for mapping (excluding target node itself)
  const sourceNodes = useMemo(() => {
    if (!targetNode) return data.nodes;
    return data.nodes.filter((n) => n.id !== targetNode.id);
  }, [data.nodes, targetNode]);

  // Selected active source node
  const activeSourceNode = useMemo(() => {
    if (!selectedSourceNodeId) return sourceNodes[0] || null;
    return sourceNodes.find((n) => n.id === selectedSourceNodeId) || sourceNodes[0] || null;
  }, [sourceNodes, selectedSourceNodeId]);

  // Target Node config fields
  const targetConfig = targetNode?.data?.config || {};

  // Destination fields based on target node type
  const destinationFields = useMemo(() => {
    if (!targetNode) return [];

    const type = targetNode.type;
    if (type === 'gmail') {
      return [
        { key: 'to', label: 'Recipient Email (To)', required: true, description: 'Target email address' },
        { key: 'cc', label: 'CC Email', description: 'Carbon copy email addresses' },
        { key: 'subject', label: 'Email Subject', required: true, description: 'Subject line' },
        { key: 'body', label: 'Email Body (Text/HTML)', required: true, isTextarea: true, description: 'Content body of the email' },
      ];
    }

    if (type === 'http') {
      return [
        { key: 'url', label: 'HTTP Request URL', required: true, description: 'Target endpoint URL' },
        { key: 'method', label: 'HTTP Method', description: 'GET, POST, PUT, DELETE' },
        { key: 'headers', label: 'Request Headers', isTextarea: true, description: 'JSON headers object' },
        { key: 'body', label: 'Request Body Payload', isTextarea: true, description: 'JSON body payload' },
      ];
    }

    if (type === 'slack' || type === 'discord') {
      return [
        { key: 'channel', label: 'Channel Name / ID', required: true, description: 'Slack/Discord channel' },
        { key: 'message', label: 'Message Body', required: true, isTextarea: true, description: 'Notification message' },
      ];
    }

    if (type === 'mongodb') {
      return [
        { key: 'collection', label: 'Collection Name', required: true, description: 'Target MongoDB collection' },
        { key: 'query', label: 'MongoDB Query JSON', isTextarea: true, description: 'Filter or query JSON object' },
      ];
    }

    const keys = Object.keys(targetConfig);
    if (keys.length > 0) {
      return keys.map((k) => ({
        key: k,
        label: k.charAt(0).toUpperCase() + k.slice(1),
        description: `Configuration key ${k}`,
      }));
    }

    return [
      { key: 'message', label: 'Payload Data', isTextarea: true },
    ];
  }, [targetNode, targetConfig]);

  // Active mappings list for Inspector
  const activeMappings = useMemo(() => {
    const list = [];
    destinationFields.forEach((field) => {
      const val = targetConfig[field.key];
      if (val && typeof val === 'string' && val.includes('{{')) {
        const matches = val.match(/\{\{\s*(.*?)\s*\}\}/g) || [];
        matches.forEach((m) => {
          const expr = m.replace(/^\{\{\s*/, '').replace(/\s*\}\}$/, '').trim();
          const validation = VariableEngine.validate(m, {
            'http.statusCode': 200,
            'http.data.temp': 28.5,
            'http.data.name': 'Divyansh',
            'webhook.body.email': 'divyansh@example.com',
            'gmail.messageId': '18ab4d8d90ef',
          });

          list.push({
            targetField: field.label,
            targetKey: field.key,
            expression: m,
            rawPath: expr,
            sourceNode: expr.split('.')[0] || 'Unknown',
            isValid: validation.isValid,
            resolvedValue: VariableEngine.resolve(m, {
              'http.statusCode': 200,
              'http.data.temp': 28.5,
              'http.data.name': 'Divyansh',
              'webhook.body.email': 'divyansh@example.com',
            }),
          });
        });
      }
    });
    return list;
  }, [destinationFields, targetConfig]);

  if (!isOpen || !targetNode) return null;

  // Handle Drag Over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle Drop onto destination field
  const handleDrop = (fieldKey, e) => {
    e.preventDefault();
    const droppedExpr = e.dataTransfer.getData('text/plain');
    if (droppedExpr) {
      const currentVal = targetConfig[fieldKey] || '';
      const nextVal = currentVal ? `${currentVal} ${droppedExpr}` : droppedExpr;
      onUpdateTargetNodeConfig(targetNode.id, fieldKey, nextVal);
    }
  };

  // Clear mapped field
  const handleClearField = (fieldKey) => {
    onUpdateTargetNodeConfig(targetNode.id, fieldKey, '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-6xl h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Visual Data Mapper Engine
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Target: {targetNode.data?.label || targetNode.type}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Drag variables from source outputs on the left directly into destination fields on the right.
              </p>
            </div>
          </div>

          {/* Tab Controls & Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('mapper')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'mapper'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Visual Mapper
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('inspector')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'inspector'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" /> Mapping Inspector ({activeMappings.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> Raw JSON Preview
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Visual Mapper Canvas */}
        {activeTab === 'mapper' && (
          <div className="flex-1 grid grid-cols-12 overflow-hidden bg-slate-950/50 divide-x divide-slate-800">
            {/* Left Column: Source Node Outputs (Width: 5 cols) */}
            <div className="col-span-5 flex flex-col h-full overflow-hidden bg-slate-900/40">
              {/* Source Node Switcher */}
              <div className="p-3 border-b border-slate-800 bg-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" /> Source Output Node
                  </span>
                  {activeSourceNode && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                      {activeSourceNode.nodeName}
                    </span>
                  )}
                </div>

                <select
                  value={activeSourceNode?.id || ''}
                  onChange={(e) => setSelectedSourceNodeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {sourceNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.nodeName} ({n.nodeType})
                    </option>
                  ))}
                </select>

                {/* Search Filter */}
                <div className="relative pt-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter outputs (email, temp, body)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Source Output Tree */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {activeSourceNode ? (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-2">
                    <JSONTreeExplorer
                      data={
                        searchQuery.trim()
                          ? VariableEngine.filterTreeNodes(activeSourceNode.outputs, searchQuery.toLowerCase())
                          : activeSourceNode.outputs
                      }
                      onInsert={(expr) => {
                        const emptyField = destinationFields.find((f) => !targetConfig[f.key]);
                        const targetKey = emptyField ? emptyField.key : destinationFields[0]?.key;
                        if (targetKey) {
                          const currentVal = targetConfig[targetKey] || '';
                          onUpdateTargetNodeConfig(targetNode.id, targetKey, currentVal ? `${currentVal} ${expr}` : expr);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs text-center py-8">No source nodes available.</p>
                )}
              </div>
            </div>

            {/* Right Column: Destination Target Node Fields (Width: 7 cols) */}
            <div className="col-span-7 flex flex-col h-full overflow-hidden bg-slate-900/20">
              {/* Header */}
              <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Destination Node Fields
                </span>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                  Drag & Drop Mapping Active
                </span>
              </div>

              {/* Target Fields List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {destinationFields.map((field) => {
                  const mappedVal = targetConfig[field.key] || '';
                  const hasVariable = mappedVal.includes('{{');
                  const validation = VariableEngine.validate(mappedVal, {
                    'http.statusCode': 200,
                    'http.data.temp': 28.5,
                    'http.data.name': 'Divyansh',
                    'webhook.body.email': 'divyansh@example.com',
                  });

                  return (
                    <div
                      key={field.key}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(field.key, e)}
                      className={`p-4 rounded-2xl border transition-all space-y-2 ${
                        !validation.isValid
                          ? 'bg-rose-500/5 border-rose-500/40'
                          : hasVariable
                          ? 'bg-purple-500/5 border-purple-500/30'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Field Label & Actions */}
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{field.label}</span>
                          {field.required && <span className="text-amber-400">*</span>}
                        </label>

                        <div className="flex items-center gap-2">
                          {!validation.isValid ? (
                            <span
                              className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md"
                              title={`Variable no longer exists: ${validation.unknownVars.join(', ')}`}
                            >
                              <AlertTriangle className="w-3 h-3 text-rose-400" /> Unknown Variable
                            </span>
                          ) : hasVariable ? (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3" /> Mapped
                            </span>
                          ) : null}

                          {mappedVal && (
                            <button
                              type="button"
                              onClick={() => handleClearField(field.key)}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                              title="Clear field"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {field.description && (
                        <p className="text-[11px] text-slate-500">{field.description}</p>
                      )}

                      {/* Target Field Input Box */}
                      {field.isTextarea ? (
                        <textarea
                          rows={3}
                          value={mappedVal}
                          onChange={(e) => onUpdateTargetNodeConfig(targetNode.id, field.key, e.target.value)}
                          placeholder={`Drag variable here e.g. {{${activeSourceNode?.outputs?.[0]?.path || 'variable'}}}`}
                          className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs font-mono text-slate-100 focus:outline-none transition-colors ${
                            !validation.isValid ? 'border-rose-500/80' : 'border-slate-800 focus:border-purple-500'
                          }`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={mappedVal}
                          onChange={(e) => onUpdateTargetNodeConfig(targetNode.id, field.key, e.target.value)}
                          placeholder={`Drag variable here e.g. {{${activeSourceNode?.outputs?.[0]?.path || 'variable'}}}`}
                          className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs font-mono text-slate-100 focus:outline-none transition-colors ${
                            !validation.isValid ? 'border-rose-500/80' : 'border-slate-800 focus:border-purple-500'
                          }`}
                        />
                      )}

                      {/* Mapped Variable Visual Binding Badge */}
                      {hasVariable && (
                        <div className="p-2 px-2.5 rounded-xl bg-slate-950 border border-purple-500/20 text-[10px] font-mono flex items-center justify-between text-purple-300">
                          <div className="flex items-center gap-1.5 truncate">
                            <ArrowRight className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                            <span className="font-bold text-slate-400">Binding:</span>
                            <span className="truncate">{mappedVal}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Mapping Inspector */}
        {activeTab === 'inspector' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/40">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Data Mapping Inspector</h3>
                <p className="text-xs text-slate-400">Complete summary of active variable bindings and transformations.</p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {activeMappings.length} Active Mappings
              </span>
            </div>

            {activeMappings.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active data mappings found. Drag variables into destination fields to create mappings.
              </div>
            ) : (
              <div className="space-y-3">
                {activeMappings.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between font-mono text-xs"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Source */}
                      <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                        <span className="text-[10px] font-sans text-slate-500 uppercase block">Source</span>
                        <span className="font-bold">{m.expression}</span>
                      </div>

                      <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0" />

                      {/* Destination */}
                      <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                        <span className="text-[10px] font-sans text-slate-500 uppercase block">Destination</span>
                        <span className="font-bold">{m.targetField}</span>
                      </div>

                      {/* Resolved Live Value */}
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 truncate max-w-xs">
                        <span className="text-[10px] font-sans text-slate-500 uppercase block">Evaluated Output</span>
                        <span className="truncate block">{String(m.resolvedValue)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClearField(m.targetKey)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-4"
                      title="Delete Mapping"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Raw JSON Config Preview */}
        {activeTab === 'preview' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/40 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">Target Node Config JSON Payload</span>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 overflow-x-auto">
                {JSON.stringify(targetConfig, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Universal Variable Mapper Engine • AutomateX</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all"
          >
            Apply Data Mapping
          </button>
        </div>
      </div>
    </div>
  );
};
