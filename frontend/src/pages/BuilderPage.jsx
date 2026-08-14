import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import { NODE_TYPES, NODE_REGISTRY } from '../modules/builder/nodeRegistry';
import { CustomNode } from '../modules/builder/components/CustomNode';
import { NodeSidebar } from '../modules/builder/components/NodeSidebar';
import { NodeInspector } from '../modules/builder/components/NodeInspector';
import { workflowApi } from '../api/workflowApi';
import { executionApi } from '../api/executionApi';
import {
  Play,
  Save,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles,
  Layers,
  Terminal,
  Activity
} from 'lucide-react';

const INITIAL_STARTER_NODES = [
  {
    id: 'node_trigger_1',
    type: NODE_TYPES.MANUAL_TRIGGER,
    position: { x: 150, y: 200 },
    data: { label: 'Manual Trigger', config: {} },
  },
  {
    id: 'node_http_1',
    type: NODE_TYPES.HTTP_REQUEST,
    position: { x: 480, y: 200 },
    data: {
      label: 'HTTP Request',
      config: {
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/todos/1',
      },
    },
  },
  {
    id: 'node_log_1',
    type: NODE_TYPES.LOG_ACTION,
    position: { x: 810, y: 200 },
    data: {
      label: 'Console Logger',
      config: { message: 'Workflow finished executing successfully!' },
    },
  },
];

const INITIAL_STARTER_EDGES = [
  { id: 'e1', source: 'node_trigger_1', target: 'node_http_1', animated: true },
  { id: 'e2', source: 'node_http_1', target: 'node_log_1', animated: true },
];

export const BuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowDesc, setWorkflowDesc] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_STARTER_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_STARTER_EDGES);

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'SUCCESS' | 'ERROR'
  const [executionResult, setExecutionResult] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);

  // Define custom node types for React Flow
  const nodeTypes = useMemo(() => {
    const types = {};
    Object.entries(NODE_TYPES).forEach(([typeKey, typeVal]) => {
      types[typeKey] = CustomNode;
      if (typeVal) types[typeVal] = CustomNode;
    });
    return types;
  }, []);

  // Fetch workflow data if editing existing workflow
  useEffect(() => {
    if (id && id !== 'new') {
      loadWorkflow(id);
    }
  }, [id]);

  const loadWorkflow = async (workflowId) => {
    try {
      const data = await workflowApi.getWorkflowById(workflowId);
      setWorkflow(data);
      setWorkflowName(data.name || 'Untitled Workflow');
      setWorkflowDesc(data.description || '');
      if (data.nodes && Array.isArray(data.nodes)) {
        const sanitized = data.nodes
          .filter(Boolean)
          .map((node, idx) => ({
            ...node,
            position: (node && node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number')
              ? node.position
              : { x: 150 + (idx * 60), y: 150 + (idx * 60) },
          }));
        setNodes(sanitized);
      }
      if (data.edges && Array.isArray(data.edges)) setEdges(data.edges.filter(Boolean));
    } catch (err) {
      console.error('Error loading workflow:', err);
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const rawX = event.clientX - reactFlowBounds.left - 100;
      const rawY = event.clientY - reactFlowBounds.top - 30;

      const position = {
        x: Number.isNaN(rawX) ? 200 : rawX,
        y: Number.isNaN(rawY) ? 200 : rawY,
      };

      const meta = NODE_REGISTRY[type] || { label: type };
      const newNode = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: {
          label: meta.label,
          config: { ...meta.defaultConfig },
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setSelectedNodeId(newNode.id);
    },
    [setNodes]
  );

  const onNodeClick = (_, node) => {
    setSelectedNodeId(node.id);
  };

  const handleUpdateNodeData = (nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === nodeId ? { ...node, data: newData } : node))
    );
  };

  const handleDeleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
  };

  // Save workflow graph
  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      const payload = {
        name: workflowName,
        description: workflowDesc,
        nodes,
        edges,
      };

      let saved;
      if (workflow && workflow._id) {
        saved = await workflowApi.updateWorkflow(workflow._id, payload);
      } else {
        saved = await workflowApi.createWorkflow(payload);
        setWorkflow(saved);
        navigate(`/builder/${saved._id}`, { replace: true });
      }

      setSaveStatus('SUCCESS');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Error saving workflow:', err);
      setSaveStatus('ERROR');
    } finally {
      setSaving(false);
    }
  };

  // Trigger Live Test Run of Workflow Engine
  const handleTestRun = async () => {
    setExecuting(true);
    setExecutionResult(null);
    setShowLogModal(true);

    // Update node statuses to running
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, executionStatus: 'RUNNING' } })));

    try {
      const res = await executionApi.testRun(workflow?._id || 'draft', nodes, edges, {});
      setExecutionResult(res.execution);

      // Update canvas node statuses based on step results
      const stepMap = new Map(
        (res.execution.stepResults || []).map((s) => [s.nodeId, s.status])
      );

      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            executionStatus: stepMap.get(n.id) || 'SUCCESS',
          },
        }))
      );
    } catch (err) {
      console.error('Execution failed:', err);
      setExecutionResult({
        status: 'FAILED',
        errorDetails: err.response?.data?.message || err.message,
        stepResults: [],
      });
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, executionStatus: 'FAILED' } })));
    } finally {
      setExecuting(false);
    }
  };

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950">
      {/* Builder Top Bar Navbar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-30 select-none">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Workflows
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2 min-w-0">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-100 focus:outline-none focus:bg-slate-950 px-2 py-1 rounded border border-transparent focus:border-slate-800 transition-colors truncate max-w-xs"
              placeholder="Workflow Name"
            />
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-3">
          {saveStatus === 'SUCCESS' && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Canvas</span>
          </button>

          <button
            onClick={handleTestRun}
            disabled={executing}
            className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md hover:shadow-brand-500/20 disabled:opacity-50"
          >
            {executing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>Execute Workflow</span>
          </button>
        </div>
      </header>

      {/* Main Canvas Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Node Library */}
        <NodeSidebar />

        {/* React Flow Graph Drag & Drop Canvas */}
        <div className="flex-1 h-full relative" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Background color="#334155" gap={20} size={1} />
            <Controls className="!bottom-4 !left-4" />
            <MiniMap
              className="!bottom-4 !right-4"
              nodeColor={(node) => {
                if (node.type === NODE_TYPES.MANUAL_TRIGGER) return '#10b981';
                if (node.type === NODE_TYPES.HTTP_REQUEST) return '#3b82f6';
                if (node.type === NODE_TYPES.CONDITION) return '#f43f5e';
                return '#64748b';
              }}
            />
          </ReactFlow>
        </div>

        {/* Right Inspector Drawer */}
        {selectedNode && (
          <NodeInspector
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNodeData}
            onDeleteNode={handleDeleteNode}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>

      {/* Live Execution Output Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-brand-400" />
                <h3 className="text-sm font-semibold text-slate-100">Workflow Execution Logs</h3>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {executing && (
                <div className="flex items-center justify-center py-12 gap-3 text-amber-400 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Executing workflow graph steps...</span>
                </div>
              )}

              {executionResult && (
                <div className="space-y-4 text-xs font-sans">
                  {/* Summary Bar */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Status:</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          executionResult.status === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {executionResult.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5" /> Total Time: {executionResult.durationMs}ms
                    </div>
                  </div>

                  {executionResult.errorDetails && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300">
                      <strong>Engine Error:</strong> {executionResult.errorDetails}
                    </div>
                  )}

                  {/* Step Results List */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-300 text-xs tracking-wider uppercase">
                      Execution Step Trace ({executionResult.stepResults?.length || 0})
                    </h4>

                    {executionResult.stepResults?.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2"
                      >
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-slate-200">{step.label}</span>
                            <span className="text-[10px] font-mono text-slate-500">({step.nodeType})</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{step.durationMs}ms</span>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-500 font-semibold mb-1 uppercase">Step Output Payload:</div>
                          <pre className="p-2.5 bg-slate-900/80 rounded-lg text-emerald-400 font-mono text-[10px] overflow-x-auto border border-slate-800/80">
                            {JSON.stringify(step.outputData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
