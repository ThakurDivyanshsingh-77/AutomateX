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
import GeminiStructureTournamentNode from '../nodes/geminiStructureTournament/GeminiStructureTournamentNode';
import ForEachTournamentNode from '../nodes/forEachTournament/ForEachTournamentNode';
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
  [NODE_TYPES.GEMINI_STRUCTURE_TOURNAMENT]: GeminiStructureTournamentNode,
  geminiStructureTournament: GeminiStructureTournamentNode,
  gemini_structure_tournament: GeminiStructureTournamentNode,
  structureTournament: GeminiStructureTournamentNode,
  [NODE_TYPES.FOR_EACH_TOURNAMENT]: ForEachTournamentNode,
  forEachTournament: ForEachTournamentNode,
  for_each_tournament: ForEachTournamentNode,
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
        setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#ea580c', strokeWidth: 2.5 } }, eds));
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
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/workflows')}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Workflows
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-50 border border-orange-200 text-brand-600">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                {workflow?.name || 'Untitled Workflow'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 capitalize">
                  {workflow?.status || 'draft'}
                </span>
                {currentVersion && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 flex items-center gap-0.5">
                    <Tag className="w-2.5 h-2.5" /> {currentVersion}
                  </span>
                )}
                {saveStatus === 'unsaved' && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700">
                    DRAFT
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Data Mapper Button */}
          <button
            onClick={() => setShowDataMapperModal(true)}
            className="p-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-purple-200 transition-colors shadow-sm cursor-pointer"
            title="Open Universal Visual Data Mapper"
          >
            <Zap className="w-3.5 h-3.5 text-purple-600 fill-purple-600/20" />
            Data Mapper
          </button>

          <button
            onClick={handleCopyWebhookUrl}
            className="p-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-cyan-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors shadow-sm"
            title="Copy Public Webhook Endpoint"
          >
            <Webhook className="w-3.5 h-3.5" /> Webhook URL
          </button>

          <button
            onClick={() => setShowVersionHistory(true)}
            className="p-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors shadow-sm"
            title="View Version History"
          >
            <History className="w-3.5 h-3.5 text-brand-600" />
            Version History
          </button>

          <button
            onClick={() => setShowAiDrawer(true)}
            className="p-1.5 px-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-orange-200 transition-colors shadow-sm"
            title="Open AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-600 fill-orange-600/20" />
            AI Assistant
          </button>

          <button
            onClick={() => setShowPublishDialog(true)}
            disabled={publishingVersion}
            className="p-1.5 px-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-brand-500/20 disabled:opacity-60"
            title="Publish New Version"
          >
            <Rocket className="w-3.5 h-3.5" />
            Publish
          </button>

          {activeExecution && (
            <button
              onClick={() => setActiveExecution((prev) => (prev ? null : activeExecution))}
              className="p-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-200 shadow-sm"
            >
              <Terminal className="w-3.5 h-3.5 text-orange-600" /> View Run Logs
            </button>
          )}
        </div>
      </header>

      {/* Main Visual Builder Workspace */}
      <div className="flex-1 flex overflow-hidden relative" ref={reactFlowWrapper}>
        <NodeToolbar />

        <div className="flex-1 h-full relative overflow-hidden bg-slate-50">
          {/* Subtle Ambient Studio Lighting Meshes for Depth */}
          <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-15%,rgba(255,79,0,0.07),transparent_60%)]" />
          <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_60%_60%_at_90%_90%,rgba(249,115,22,0.05),transparent_50%)]" />
          <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_50%_50%_at_10%_80%,rgba(99,102,241,0.03),transparent_50%)]" />

          <CanvasControls
            saveStatus={saveStatus}
            onSave={() => saveWorkflow(nodes, edges)}
            onRun={handleRunWorkflow}
            isRunning={isRunning}
          />

          <ReactFlow
            nodes={nodes}
            edges={edges.map((e) => ({
              ...e,
              style: {
                stroke: (e.style?.stroke === '#6366f1' || !e.style?.stroke) ? '#ea580c' : e.style.stroke,
                strokeWidth: e.style?.strokeWidth || 2.5,
                ...e.style,
              },
            }))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#ea580c', strokeWidth: 2.5 },
            }}
            fitView
            colorMode="light"
            className="bg-transparent"
          >
            {/* Layer 1: Subtle Minor Sub-grid (24px) */}
            <Background id="sub-grid" variant="lines" gap={24} color="rgba(226, 232, 240, 0.7)" lineWidth={1} />
            {/* Layer 2: Major Section Grid (120px) with crisp precision accent */}
            <Background id="major-grid" variant="lines" gap={120} color="rgba(203, 213, 225, 0.9)" lineWidth={1.2} />
            {/* Layer 3: Precision Intersection Points */}
            <Background id="dot-intersections" variant="dots" gap={120} size={2.5} color="#ea580c" className="opacity-40" />
            
            <MiniMap
              nodeColor={(node) => {
                if (node.type === NODE_TYPES.START) return '#10b981';
                if (node.type === NODE_TYPES.END) return '#f43f5e';
                if (node.type === NODE_TYPES.GMAIL) return '#ea4335';
                return '#ff4f00';
              }}
              maskColor="rgba(241, 245, 249, 0.7)"
              className="!bg-white !border-slate-200 !rounded-xl overflow-hidden shadow-sm"
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
