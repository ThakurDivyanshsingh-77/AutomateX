import React from 'react';
import { NODE_REGISTRY } from '../nodes/registry/nodeRegistry';
import { AutoForm } from '../nodes/properties/AutoForm';
import { GmailProperties } from '../nodes/properties/GmailProperties';
import { ConditionProperties } from '../nodes/condition/ConditionProperties';
import { WebhookProperties } from '../nodes/webhook/WebhookProperties';
import { CronProperties } from '../nodes/cron/CronProperties';
import { X, Trash2, Settings2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const PropertiesPanel = ({
  selectedNode,
  onClose,
  onUpdateNodeData,
  onDeleteNode,
  workflowId,
}) => {
  if (!selectedNode) return null;

  const registryEntry = NODE_REGISTRY[selectedNode.type] || {};
  const config = selectedNode.data?.config || {};
  const Icon = registryEntry.icon || Settings2;

  // Run dynamic validator if present
  const validationResult = registryEntry.validate
    ? registryEntry.validate(config)
    : { isValid: true, errors: {} };

  const handleLabelChange = (e) => {
    onUpdateNodeData(selectedNode.id, { label: e.target.value });
  };

  const handleConfigChange = (field, value) => {
    const nextConfig = { ...config, [field]: value };
    const nextValidation = registryEntry.validate
      ? registryEntry.validate(nextConfig)
      : { isValid: true, errors: {} };

    onUpdateNodeData(selectedNode.id, {
      config: nextConfig,
      isValid: nextValidation.isValid,
      validationErrors: nextValidation.errors,
    });
  };

  const isGmailNode = selectedNode.type === 'gmail';
  const isConditionNode = selectedNode.type === 'condition';
  const isWebhookNode = selectedNode.type === 'webhook';
  const isCronNode = selectedNode.type === 'cron';

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full select-none shadow-2xl">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${registryEntry.badgeColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200">
              Node Properties
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              {registryEntry.category || 'NODE'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Controls Body */}
      <div className="p-4 overflow-y-auto space-y-5 flex-1 text-xs">
        {/* Node Validation Status Banner */}
        {!isGmailNode && !isWebhookNode && (
          !validationResult.isValid ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] flex items-start gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Invalid Configuration</span>
                Please fix the highlighted fields below.
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Node configuration valid</span>
            </div>
          )
        )}

        {/* Node Custom Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Node Name / Title
          </label>
          <input
            type="text"
            value={selectedNode.data?.label || ''}
            onChange={handleLabelChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        {/* Configuration Parameter Panel */}
        <div className="pt-3 border-t border-slate-800 space-y-4">
          <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Configuration Parameters
          </h4>

          {isGmailNode ? (
            <GmailProperties
              node={selectedNode}
              onUpdateNodeData={onUpdateNodeData}
            />
          ) : isConditionNode ? (
            <ConditionProperties
              node={selectedNode}
              onUpdateNodeData={onUpdateNodeData}
            />
          ) : isWebhookNode ? (
            <WebhookProperties
              node={selectedNode}
              onUpdateNodeData={onUpdateNodeData}
              workflowId={workflowId}
            />
          ) : isCronNode ? (
            <CronProperties
              node={selectedNode}
              onUpdateNodeData={onUpdateNodeData}
            />
          ) : (
            <AutoForm
              configSchema={registryEntry.configSchema}
              config={config}
              errors={validationResult.errors}
              onChange={handleConfigChange}
            />
          )}
        </div>
      </div>

      {/* Panel Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <Button
          variant="danger"
          size="sm"
          className="w-full justify-center"
          onClick={() => onDeleteNode(selectedNode.id)}
        >
          <Trash2 className="w-4 h-4" /> Delete Node
        </Button>
      </div>
    </aside>
  );
};
