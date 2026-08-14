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
import { WebhookNode } from '../nodes/webhook/WebhookNode';
import { TryCatchNode } from '../nodes/tryCatch/TryCatchNode';
import { CronNode } from '../nodes/cron/CronNode';
import { PdfGeneratorNode } from '../nodes/pdf/PdfGeneratorNode';
import { FileUploadNode } from '../nodes/fileUpload/FileUploadNode';
import { DocumentExtractNode } from '../nodes/documentExtract/DocumentExtractNode';
import { WebsiteConnectNode } from '../nodes/websiteConnect/WebsiteConnectNode';
import { GeminiStructureProductsNode } from '../nodes/geminiStructureProducts/GeminiStructureProductsNode';
import { ForEachProductNode } from '../nodes/forEachProduct/ForEachProductNode';
import { WebsiteCreateProductNode } from '../nodes/websiteCreateProduct/WebsiteCreateProductNode';
import WebsiteCreateTournamentNode from '../nodes/websiteCreateTournament/WebsiteCreateTournamentNode';
import { GoogleSheetsTriggerNode } from '../nodes/googleSheets/GoogleSheetsTriggerNode';
import { DiscordMessageReceivedNode } from '../components/DiscordMessageReceivedNode';

import { NodeToolbar } from './NodeToolbar';
import { PropertiesPanel } from './PropertiesPanel';
import { CanvasControls } from './CanvasControls';
import { ExecutionLogsDrawer } from './ExecutionLogsDrawer';

// Phase 10 — Versioning Components
import { VersionHistoryPanel } from '../components/VersionHistoryPanel';
import { PublishDialog } from '../components/PublishDialog';
import { CompareVersionsModal } from '../components/CompareVersionsModal';
import { versionService } from '../services/versionService';

// Phase 12 — AI Assistant Component
import { AIAssistantDrawer } from '../components/AIAssistantDrawer';

// Phase 13 — Data Mapper & Variable Engine
import { DataMapperPanel } from '../components/DataMapperPanel';

import { executionService } from '../services/executionService';
import { Loader } from '../../../components/ui/Loader';
import toast from 'react-hot-toast';
import { ArrowLeft, GitFork, Terminal, Webhook, History, Rocket, Tag, Sparkles, Zap } from 'lucide-react';

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
  [NODE_TYPES.CRON]: CronNode,
  [NODE_TYPES.PDF_GENERATOR]: PdfGeneratorNode,
  [NODE_TYPES.FILE_UPLOAD]: FileUploadNode,
  fileUploadDocument: FileUploadNode,
  [NODE_TYPES.DOCUMENT_EXTRACT]: DocumentExtractNode,
  documentExtract: DocumentExtractNode,
  [NODE_TYPES.WEBSITE_CONNECT]: WebsiteConnectNode,
  websiteConnect: WebsiteConnectNode,
  website_connect: WebsiteConnectNode,
  [NODE_TYPES.GEMINI_STRUCTURE_PRODUCTS]: GeminiStructureProductsNode,
  geminiStructureProducts: GeminiStructureProductsNode,
  gemini_structure_products: GeminiStructureProductsNode,
  [NODE_TYPES.FOR_EACH_PRODUCT]: ForEachProductNode,
  forEachProduct: ForEachProductNode,
  for_each_product: ForEachProductNode,
  [NODE_TYPES.WEBSITE_CREATE_PRODUCT]: WebsiteCreateProductNode,
  websiteCreateProduct: WebsiteCreateProductNode,
  website_create_product: WebsiteCreateProductNode,
  [NODE_TYPES.WEBSITE_CREATE_TOURNAMENT]: WebsiteCreateTournamentNode,
  websiteCreateTournament: WebsiteCreateTournamentNode,
  website_create_tournament: WebsiteCreateTournamentNode,
  createTournament: WebsiteCreateTournamentNode,
  googleSheetsTrigger: GoogleSheetsTriggerNode,
  googleSheetsTriggerWatchRows: GoogleSheetsTriggerNode,
  discordMessageReceived: DiscordMessageReceivedNode,
  discordMessageReceivedTrigger: DiscordMessageReceivedNode,
};

const BuilderInner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [activeExecution, setActiveExecution] = useState(null);

  // ─── Phase 10: Versioning State ──────────────────────────────────────────────
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [compareVersions, setCompareVersions] = useState(null);
  const [publishingVersion, setPublishingVersion] = useState(false);

  // ─── Phase 12: AI State ──────────────────────────────────────────────────────
  const [showAiDrawer, setShowAiDrawer] = useState(false);

  // ─── Phase 13: Data Mapper State ──────────────────────────────────────────────
  const [showDataMapperModal, setShowDataMapperModal] = useState(false);

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
    const apiBase = (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname !== 'localhost'))
      ? 'https://automatex-a839.onrender.com/api/v1'
      : (import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api/v1`);
    const url = `${apiBase}/webhooks/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Public Webhook URL copied!');
  };

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

      const rawPos = screenToFlowPosition
        ? screenToFlowPosition({ x: event.clientX, y: event.clientY })
        : { x: 250, y: 150 };

      const position = (rawPos && typeof rawPos.x === 'number' && typeof rawPos.y === 'number' && !Number.isNaN(rawPos.x) && !Number.isNaN(rawPos.y))
        ? rawPos
        : { x: 250, y: 150 };

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

  const handlePublish = async ({ bump, title, description, changeSummary }) => {
    setPublishingVersion(true);
    try {
      await saveWorkflow(nodes, edges);
      const currentDefinition = { nodes, edges, viewport: { x: 0, y: 0, zoom: 1 } };

      const res = await versionService.publishVersion(id, {
        definition: currentDefinition,
        changeSummary,
        bump,
        title,
        description,
      });

      const newVersion = res.version?.version || res.workflow?.currentVersion || 'new version';
      toast.success(`🚀 Workflow published as ${newVersion}!`);
      setShowPublishDialog(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Publish failed';
      toast.error(msg);
      throw err;
    } finally {
      setPublishingVersion(false);
    }
  };

  const handleRestore = async (versionTag) => {
    const res = await versionService.restoreVersion(id, versionTag);
    toast.success(res.message || `Restored to ${versionTag}`);
    window.location.reload();
  };

  if (loading) {
    return <Loader fullScreen text="Opening Visual Canvas Editor..." />;
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const currentVersion = workflow?.currentVersion || workflow?.publishedVersion;

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
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 capitalize">
                  {workflow?.status || 'draft'}
                </span>
                {currentVersion && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-600/15 border border-indigo-500/25 text-indigo-400 flex items-center gap-0.5">
                    <Tag className="w-2.5 h-2.5" /> {currentVersion}
                  </span>
                )}
                {saveStatus === 'unsaved' && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/25 text-amber-400">
                    DRAFT
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Phase 13: Data Mapper Button */}
          <button
            onClick={() => setShowDataMapperModal(true)}
            className="p-1.5 px-3 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-purple-500/30 transition-colors shadow-sm cursor-pointer"
            title="Open Universal Visual Data Mapper"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20" />
            Data Mapper
          </button>

          <button
            onClick={handleCopyWebhookUrl}
            className="p-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Copy Public Webhook Endpoint"
          >
            <Webhook className="w-3.5 h-3.5" /> Webhook URL
          </button>

          <button
            onClick={() => setShowVersionHistory(true)}
            className="p-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="View Version History"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            Version History
          </button>

          <button
            onClick={() => setShowAiDrawer(true)}
            className="p-1.5 px-3 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-500/30 transition-colors shadow-sm"
            title="Open AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
            AI Assistant
          </button>

          <button
            onClick={() => setShowPublishDialog(true)}
            disabled={publishingVersion}
            className="p-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-60"
            title="Publish New Version"
          >
            <Rocket className="w-3.5 h-3.5" />
            Publish
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
          workflowId={id}
          workflowNodes={nodes}
          executionSnapshot={activeExecution}
        />

        {activeExecution && (
          <ExecutionLogsDrawer
            execution={activeExecution}
            onClose={() => setActiveExecution(null)}
          />
        )}
      </div>

      {/* Versioning Modals */}
      {showVersionHistory && (
        <VersionHistoryPanel
          workflowId={id}
          currentVersion={currentVersion}
          onClose={() => setShowVersionHistory(false)}
          onRestore={handleRestore}
          onCompare={(vA, vB) => {
            setShowVersionHistory(false);
            setCompareVersions({ versionA: vA, versionB: vB });
          }}
          onPublish={() => {
            setShowVersionHistory(false);
            setShowPublishDialog(true);
          }}
        />
      )}

      {showPublishDialog && (
        <PublishDialog
          workflowId={id}
          currentVersion={currentVersion}
          onPublish={handlePublish}
          onClose={() => setShowPublishDialog(false)}
        />
      )}

      {compareVersions && (
        <CompareVersionsModal
          workflowId={id}
          versionA={compareVersions.versionA}
          versionB={compareVersions.versionB}
          onClose={() => setCompareVersions(null)}
        />
      )}

      {/* AI Assistant Drawer */}
      {showAiDrawer && (
        <AIAssistantDrawer
          workflowId={id}
          nodes={nodes}
          edges={edges}
          onApplyDefinition={(newNodes, newEdges) => {
            setNodes(newNodes);
            setEdges(newEdges);
            saveWorkflow(newNodes, newEdges);
          }}
          onClose={() => setShowAiDrawer(false)}
        />
      )}

      {/* Phase 13: Data Mapper Modal */}
      {showDataMapperModal && (
        <DataMapperPanel
          isOpen={showDataMapperModal}
          onClose={() => setShowDataMapperModal(false)}
          targetNode={selectedNode || nodes[1] || nodes[0]}
          workflowNodes={nodes}
          executionSnapshot={activeExecution}
          onUpdateTargetNodeConfig={(nodeId, field, val) => {
            updateNodeData(nodeId, {
              config: {
                ...(nodes.find((n) => n.id === nodeId)?.data?.config || {}),
                [field]: val,
              },
            });
          }}
        />
      )}
    </div>
  );
};

export const WorkflowCanvas = () => (
  <ReactFlowProvider>
    <BuilderInner />
  </ReactFlowProvider>
);

export default WorkflowCanvas;
