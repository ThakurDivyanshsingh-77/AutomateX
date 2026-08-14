import React from 'react';
import { NODE_REGISTRY } from '../nodeRegistry';
import { X, Trash2, Sliders, CheckCircle2, Code2, Globe, Clock, GitBranch, Terminal } from 'lucide-react';
import { DiscordMessageReceivedProperties } from '../../../features/workflow/components/DiscordMessageReceivedProperties';
import { WebsiteConnectProperties } from '../../../features/workflow/nodes/websiteConnect/WebsiteConnectProperties';
import { GeminiStructureProductsProperties } from '../../../features/workflow/nodes/geminiStructureProducts/GeminiStructureProductsProperties';
import { ForEachProductProperties } from '../../../features/workflow/nodes/forEachProduct/ForEachProductProperties';
import { WebsiteCreateProductProperties } from '../../../features/workflow/nodes/websiteCreateProduct/WebsiteCreateProductProperties';
import WebsiteCreateTournamentProperties from '../../../features/workflow/nodes/websiteCreateTournament/WebsiteCreateTournamentProperties';
import GeminiStructureTournamentProperties from '../../../features/workflow/nodes/geminiStructureTournament/GeminiStructureTournamentProperties';
import ForEachTournamentProperties from '../../../features/workflow/nodes/forEachTournament/ForEachTournamentProperties';

export const NodeInspector = ({ selectedNode, onUpdateNode, onDeleteNode, onClose }) => {
  if (!selectedNode) return null;

  const nodeType = selectedNode.type;
  const meta = NODE_REGISTRY[nodeType] || { label: nodeType, icon: Sliders };
  const config = selectedNode.data?.config || {};
  const label = selectedNode.data?.label || meta.label;

  const handleConfigChange = (key, value) => {
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      config: {
        ...config,
        [key]: value,
      },
    });
  };

  const handleLabelChange = (newLabel) => {
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      label: newLabel,
    });
  };

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-20 select-none shadow-2xl">
      {/* Inspector Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Sliders className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <h3 className="text-sm font-semibold text-slate-200 truncate">Configure Node</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDeleteNode(selectedNode.id)}
            title="Delete Node"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title="Close Inspector"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inspector Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs">
        {/* Node Label Input */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Node Title
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 font-medium"
          />
        </div>

        <div className="h-px bg-slate-800/80" />

        {/* Dynamic Config Fields per Node Type */}
        {nodeType === 'HTTP_REQUEST' && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-brand-400 font-semibold">
              <Globe className="w-4 h-4" /> REST API Configuration
            </div>

            <div>
              <label className="block text-slate-400 mb-1">HTTP Method</label>
              <select
                value={config.method || 'GET'}
                onChange={(e) => handleConfigChange('method', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Target Endpoint URL</label>
              <input
                type="text"
                placeholder="https://api.example.com/v1/resource"
                value={config.url || ''}
                onChange={(e) => handleConfigChange('url', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 font-mono text-[11px]"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Supports variable interpolations e.g. <code className="text-slate-400 font-mono">{"{{$prev.data.id}}"}</code>
              </p>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Headers (JSON)</label>
              <textarea
                rows={3}
                placeholder='{"Authorization": "Bearer token"}'
                value={config.headers || ''}
                onChange={(e) => handleConfigChange('headers', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-brand-500 font-mono text-[11px]"
              />
            </div>

            {['POST', 'PUT', 'PATCH'].includes(config.method) && (
              <div>
                <label className="block text-slate-400 mb-1">Request Body (JSON / Text)</label>
                <textarea
                  rows={4}
                  placeholder='{"name": "john"}'
                  value={config.body || ''}
                  onChange={(e) => handleConfigChange('body', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-brand-500 font-mono text-[11px]"
                />
              </div>
            )}
          </div>
        )}

        {nodeType === 'DELAY' && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Clock className="w-4 h-4" /> Delay Duration
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Pause Execution (Seconds)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={config.seconds || 2}
                onChange={(e) => handleConfigChange('seconds', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>
        )}

        {nodeType === 'CODE_TRANSFORM' && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Code2 className="w-4 h-4" /> JavaScript Transform Function
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Function Body</label>
              <textarea
                rows={8}
                value={config.code || ''}
                onChange={(e) => handleConfigChange('code', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-cyan-300 focus:outline-none focus:border-brand-500 font-mono text-[11px] leading-relaxed"
              />
              <p className="text-[10px] text-slate-500 mt-1.5">
                Available variables: <code className="text-slate-400">$input</code> (previous step output), <code className="text-slate-400">$context</code>.
              </p>
            </div>
          </div>
        )}

        {nodeType === 'CONDITION' && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <GitBranch className="w-4 h-4" /> Condition Evaluation
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Source Field Path</label>
              <input
                type="text"
                placeholder="$prev.status"
                value={config.field || ''}
                onChange={(e) => handleConfigChange('field', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Operator</label>
              <select
                value={config.operator || 'equals'}
                onChange={(e) => handleConfigChange('operator', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
              >
                <option value="equals">Equals (===)</option>
                <option value="not_equals">Not Equals (!==)</option>
                <option value="contains">Contains</option>
                <option value="greater_than">Greater Than (&gt;)</option>
                <option value="less_than">Less Than (&lt;)</option>
                <option value="exists">Exists / Non-null</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Comparison Value</label>
              <input
                type="text"
                placeholder="200"
                value={config.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {nodeType === 'LOG_ACTION' && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <Terminal className="w-4 h-4" /> Console Logger Message
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Log Template Message</label>
              <textarea
                rows={3}
                placeholder="Finished fetching item {{node_http_1.data.id}}"
                value={config.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-brand-500 font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {nodeType === 'WEBHOOK_TRIGGER' && (
          <div className="space-y-3 bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl">
            <h5 className="font-semibold text-purple-300">Webhook Endpoints</h5>
            <p className="text-[11px] text-purple-200/80 leading-relaxed">
              When workflow is saved, send HTTP requests to:
            </p>
            <div className="p-2 bg-slate-950 border border-purple-500/30 rounded font-mono text-[10px] text-purple-300 break-all select-all">
              POST /api/v1/webhooks/YOUR_TOKEN
            </div>
          </div>
        )}

        {(nodeType === 'websiteConnect' || nodeType === 'WEBSITE_CONNECT' || nodeType === 'website_connect' || nodeType === 'website') && (
          <WebsiteConnectProperties
            node={selectedNode}
            nodeData={selectedNode.data}
            onUpdateNodeData={(id, data) => onUpdateNode(id, { ...selectedNode.data, ...data })}
            onUpdateConfig={(nextConfig) => {
              onUpdateNode(selectedNode.id, {
                ...selectedNode.data,
                config: nextConfig,
              });
            }}
          />
        )}

        {(nodeType === 'geminiStructureProducts' || nodeType === 'GEMINI_STRUCTURE_PRODUCTS' || nodeType === 'gemini_structure_products' || nodeType === 'structureProducts') && (
          <GeminiStructureProductsProperties
            node={selectedNode}
            nodeData={selectedNode.data}
            onUpdateNodeData={(id, data) => onUpdateNode(id, { ...selectedNode.data, ...data })}
            onUpdateConfig={(nextConfig) => {
              onUpdateNode(selectedNode.id, {
                ...selectedNode.data,
                config: nextConfig,
              });
            }}
          />
        )}

        {(nodeType === 'forEachProduct' || nodeType === 'FOR_EACH_PRODUCT' || nodeType === 'for_each_product' || nodeType === 'forEach') && (
          <ForEachProductProperties
            node={selectedNode}
            nodeData={selectedNode.data}
            onUpdateNodeData={(id, data) => onUpdateNode(id, { ...selectedNode.data, ...data })}
            onUpdateConfig={(nextConfig) => {
              onUpdateNode(selectedNode.id, {
                ...selectedNode.data,
                config: nextConfig,
              });
            }}
          />
        )}

        {(nodeType === 'websiteCreateProduct' || nodeType === 'WEBSITE_CREATE_PRODUCT' || nodeType === 'website_create_product' || nodeType === 'createProduct') && (
          <WebsiteCreateProductProperties
            node={selectedNode}
            nodeData={selectedNode.data}
            onUpdateNodeData={(id, data) => onUpdateNode(id, { ...selectedNode.data, ...data })}
            onUpdateConfig={(nextConfig) => {
              onUpdateNode(selectedNode.id, {
                ...selectedNode.data,
                config: nextConfig,
              });
            }}
          />
        )}

        {(nodeType === 'websiteCreateTournament' || nodeType === 'WEBSITE_CREATE_TOURNAMENT' || nodeType === 'website_create_tournament' || nodeType === 'createTournament') && (
          <WebsiteCreateTournamentProperties
            node={selectedNode}
            onUpdateNode={(updatedNode) => {
              onUpdateNode(selectedNode.id, updatedNode.data);
            }}
          />
        )}

        {(nodeType === 'geminiStructureTournament' || nodeType === 'GEMINI_STRUCTURE_TOURNAMENT' || nodeType === 'gemini_structure_tournament' || nodeType === 'structureTournament') && (
          <GeminiStructureTournamentProperties
            node={selectedNode}
            nodeData={selectedNode.data}
            onUpdateNodeData={(id, data) => onUpdateNode(id, { ...selectedNode.data, ...data })}
            onUpdateConfig={(nextConfig) => {
              onUpdateNode(selectedNode.id, {
                ...selectedNode.data,
                config: nextConfig,
              });
            }}
          />
        )}

        {(nodeType === 'forEachTournament' || nodeType === 'FOR_EACH_TOURNAMENT' || nodeType === 'for_each_tournament') && (
          <ForEachTournamentProperties
            node={selectedNode}
            nodeData={selectedNode.data}
            onUpdateNodeData={(id, data) => onUpdateNode(id, { ...selectedNode.data, ...data })}
            onUpdateConfig={(nextConfig) => {
              onUpdateNode(selectedNode.id, {
                ...selectedNode.data,
                config: nextConfig,
              });
            }}
          />
        )}

        {(nodeType === 'discordMessageReceived' || nodeType === 'discordMessageReceivedTrigger' || nodeType === 'DISCORD_MESSAGE_RECEIVED') && (
          <DiscordMessageReceivedProperties
            nodeData={selectedNode.data}
            onUpdateConfig={(nextConfig) => {
              onUpdateNode(selectedNode.id, {
                ...selectedNode.data,
                config: nextConfig,
              });
            }}
          />
        )}
      </div>

      {/* Inspector Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Config auto-saved to canvas state</span>
        </div>
      </div>
    </aside>
  );
};
