import React, { useCallback, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  addEdge,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflow } from '../hooks/useWorkflow';
import { useNodeOperations } from '../hooks/useNodeOperations';
import { NODE_TYPES } from '../nodes/registry/nodeRegistry';

import { TriggerNode } from '../nodes/TriggerNode';
import { HttpNode } from '../nodes/HttpNode';
import { DelayNode } from '../nodes/DelayNode';
import { LogNode } from '../nodes/LogNode';
import { EndNode } from '../nodes/EndNode';
import { GmailNode } from '../nodes/GmailNode';
import { ConditionNode } from '../nodes/condition';
import { WebhookNode } from '../nodes/webhook';
import { TryCatchNode } from '../nodes/tryCatch';

import { NodeToolbar } from './NodeToolbar';
import { PropertiesPanel } from './PropertiesPanel';
import { CanvasControls } from './CanvasControls';
import { ExecutionLogsDrawer } from './ExecutionLogsDrawer';

import { executionService } from '../services/executionService';
import { Loader } from '../../../components/ui/Loader';
import toast from 'react-hot-toast';
import { ArrowLeft, GitFork, Terminal, Webhook } from 'lucide-react';

const nodeTypes = {
  [NODE_TYPES.START]: TriggerNode,
  [NODE_TYPES.HTTP]: HttpNode,
  [NODE_TYPES.DELAY]: DelayNode,
  [NODE_TYPES.LOG]: LogNode,
  [NODE_TYPES.END]: EndNode,
  [NODE_TYPES.GMAIL]: GmailNode,
  [NODE_TYPES.CONDITION]: ConditionNode,
  [NODE_TYPES.WEBHOOK]: WebhookNode,
  [NODE_TYPES.TRY_CATCH]: TryCatchNode,
};

const BuilderInner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [activeExecution, setActiveExecution] = useState(null);

  const {
    workflow,
    loading,
    saveStatus,
    nodes,
    edges,
    selectedNodeId,
    setSelectedNodeId,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    saveWorkflow,
  } = useWorkflow(id);

  const { addNode, deleteNode, updateNodeData } = useNodeOperations(
    setNodes,
    setEdges,
    setSelectedNodeId
  );

  const { screenToFlowPosition } = useReactFlow();

  const handleCopyWebhookUrl = () => {
    const token = workflow?.webhookToken || id;
    const apiBase = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api/v1`;
    const url = `${apiBase}/webhooks/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Public Webhook URL copied!');
  };

  // 1. Connection Validation Guard Rules
  const isValidConnection = useCallback(
    (connection) => {
      if (connection.source === connection.target) {
        toast.error('Self-loop connections are not allowed');
        return false;
      }

      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (sourceNode && sourceNode.type === NODE_TYPES.END) {
        toast.error('End completion node cannot be used as a connection source');
        return false;
      }

      if (targetNode && targetNode.type === NODE_TYPES.START) {
        toast.error('Start trigger node cannot receive input connections');
        return false;
      }

      return true;
    },
    [nodes]
  );

  const onConnect = useCallback(
    (params) => {
      if (isValidConnection(params)) {
        setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds));
      }
    },
    [isValidConnection, setEdges]
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

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onNodeClick = useCallback(
    (_, node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  // Handle Workflow Execution Run
  const handleRunWorkflow = async () => {
    setIsRunning(true);
    try {
      await saveWorkflow(nodes, edges);
      const res = await executionService.runWorkflow(id);
      const exec = res.execution || res.data || res;
      setActiveExecution(exec);

      if (exec.status === 'success') {
        toast.success(`Workflow executed in ${exec.duration}ms!`);
      } else {
        toast.error(`Execution status: ${exec.status}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Execution error';
      toast.error(msg);
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Opening Visual Canvas Editor..." />;
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/workflows')}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Workflows
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600/10 border border-indigo-600/20 text-indigo-400">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-tight">
                {workflow?.name || 'Untitled Workflow'}
              </h2>
              <span className="text-[10px] font-mono text-slate-500 capitalize">
                Status: {workflow?.status || 'draft'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyWebhookUrl}
            className="p-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Copy Public Webhook Endpoint"
          >
            <Webhook className="w-3.5 h-3.5" /> Webhook URL
          </button>

          {activeExecution && (
            <button
              onClick={() => setActiveExecution((prev) => (prev ? null : activeExecution))}
              className="p-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" /> View Run Logs
            </button>
          )}
        </div>
      </header>

      {/* Main Visual Builder Workspace */}
      <div className="flex-1 flex overflow-hidden relative" ref={reactFlowWrapper}>
        <NodeToolbar />

        <div className="flex-1 h-full relative">
          <CanvasControls
            saveStatus={saveStatus}
            onSave={() => saveWorkflow(nodes, edges)}
            onRun={handleRunWorkflow}
            isRunning={isRunning}
          />

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            colorMode="dark"
            className="bg-slate-950"
          >
            <Background color="#334155" gap={20} size={1} />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === NODE_TYPES.START) return '#10b981';
                if (node.type === NODE_TYPES.END) return '#f43f5e';
                if (node.type === NODE_TYPES.GMAIL) return '#ea4335';
                return '#6366f1';
              }}
              maskColor="rgba(15, 23, 42, 0.8)"
              className="!bg-slate-900 !border-slate-800 !rounded-xl overflow-hidden"
            />
          </ReactFlow>
        </div>

        <PropertiesPanel
          selectedNode={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdateNodeData={updateNodeData}
          onDeleteNode={deleteNode}
        />

        {/* Execution Run Logs Slide-Over Drawer */}
        {activeExecution && (
          <ExecutionLogsDrawer
            execution={activeExecution}
            onClose={() => setActiveExecution(null)}
          />
        )}
      </div>
    </div>
  );
};

export const WorkflowCanvas = () => (
  <ReactFlowProvider>
    <BuilderInner />
  </ReactFlowProvider>
);

export default WorkflowCanvas;
