import React, { useState } from 'react';
import { NODE_REGISTRY } from '../nodes/registry/nodeRegistry';
import { AutoForm } from '../nodes/properties/AutoForm';
import { GmailProperties } from '../nodes/properties/GmailProperties';
import { ConditionProperties } from '../nodes/condition/ConditionProperties';
import { WebhookProperties } from '../nodes/webhook/WebhookProperties';
import { CronProperties } from '../nodes/cron/CronProperties';
import { X, Trash2, Settings2, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { DataMapperPanel } from '../components/DataMapperPanel';

import { MongoCrudProperties } from '../nodes/database/MongoCrudProperties';
import { MongoDBConnectionProperties } from '../nodes/database/MongoDBConnectionProperties';
import { PdfGeneratorProperties } from '../nodes/pdf/PdfGeneratorProperties';
import { GoogleSheetsProperties } from '../nodes/googleSheets/GoogleSheetsProperties';
import { GoogleSheetsTriggerProperties } from '../nodes/googleSheets/GoogleSheetsTriggerProperties';
import { DiscordProperties } from '../components/DiscordProperties';
import { DiscordEmbedProperties } from '../components/DiscordEmbedProperties';
import { DiscordCreateChannelProperties } from '../components/DiscordCreateChannelProperties';
import { DiscordDeleteChannelProperties } from '../components/DiscordDeleteChannelProperties';
import { DiscordCreateRoleProperties } from '../components/DiscordCreateRoleProperties';
import { DiscordDeleteRoleProperties } from '../components/DiscordDeleteRoleProperties';
import { DiscordAddRoleToMemberProperties } from '../components/DiscordAddRoleToMemberProperties';
import { DiscordRemoveRoleFromMemberProperties } from '../components/DiscordRemoveRoleFromMemberProperties';
import { AiGenerateTextProperties } from '../components/AiGenerateTextProperties';
import { OpenAiGenerateTextProperties } from '../components/OpenAiGenerateTextProperties';
import { GeminiGenerateTextProperties } from '../components/GeminiGenerateTextProperties';
import { DiscordMessageReceivedProperties } from '../components/DiscordMessageReceivedProperties';
import { FileUploadProperties } from '../nodes/fileUpload/FileUploadProperties';
import { DocumentExtractProperties } from '../nodes/documentExtract/DocumentExtractProperties';
import { WebsiteConnectProperties } from '../nodes/websiteConnect/WebsiteConnectProperties';
import { GeminiStructureProductsProperties } from '../nodes/geminiStructureProducts/GeminiStructureProductsProperties';
import { ForEachProductProperties } from '../nodes/forEachProduct/ForEachProductProperties';
import { WebsiteCreateProductProperties } from '../nodes/websiteCreateProduct/WebsiteCreateProductProperties';
import WebsiteCreateTournamentProperties from '../nodes/websiteCreateTournament/WebsiteCreateTournamentProperties';
import GeminiStructureTournamentProperties from '../nodes/geminiStructureTournament/GeminiStructureTournamentProperties';
import ForEachTournamentProperties from '../nodes/forEachTournament/ForEachTournamentProperties';
import { WorkflowBuilderProvider } from '../../../context/WorkflowBuilderContext';




export const PropertiesPanel = ({
  selectedNode,
  onClose,
  onUpdateNodeData,
  onDeleteNode,
  workflowId,
  workflowNodes = [],
  executionSnapshot = null,
}) => {
  const [showDataMapper, setShowDataMapper] = useState(false);

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

  const isFileUploadNode = selectedNode.type === 'fileUpload' || selectedNode.type === 'fileUploadDocument';
  const isDocumentExtractNode = selectedNode.type === 'documentExtractContent' || selectedNode.type === 'documentExtract';
  const isWebsiteConnectNode = selectedNode.type === 'websiteConnect' || selectedNode.type === 'website_connect' || selectedNode.type === 'website';
  const isGeminiStructureProductsNode = selectedNode.type === 'geminiStructureProducts' || selectedNode.type === 'gemini_structure_products' || selectedNode.type === 'structureProducts';
  const isForEachProductNode = selectedNode.type === 'forEachProduct' || selectedNode.type === 'for_each_product' || selectedNode.type === 'forEach';
  const isWebsiteCreateProductNode = selectedNode.type === 'websiteCreateProduct' || selectedNode.type === 'website_create_product' || selectedNode.type === 'createProduct';
  const isWebsiteCreateTournamentNode = selectedNode.type === 'websiteCreateTournament' || selectedNode.type === 'website_create_tournament' || selectedNode.type === 'createTournament';
  const isGeminiStructureTournamentNode = selectedNode.type === 'geminiStructureTournament' || selectedNode.type === 'gemini_structure_tournament' || selectedNode.type === 'structureTournament';
  const isForEachTournamentNode = selectedNode.type === 'forEachTournament' || selectedNode.type === 'for_each_tournament';
  const isGmailNode = selectedNode.type === 'gmail';
  const isConditionNode = selectedNode.type === 'condition';
  const isWebhookNode = selectedNode.type === 'webhook';
  const isCronNode = selectedNode.type === 'cron';
  const isMongoCrudNode = selectedNode.type.startsWith('mongo') && selectedNode.type !== 'mongodb';
  const isMongoConnNode = selectedNode.type === 'mongodb';
  const isPdfNode = selectedNode.type === 'pdfGenerator';
  const isGoogleSheetsTriggerNode = selectedNode.type === 'googleSheetsTrigger' || selectedNode.type === 'googleSheetsTriggerWatchRows';
  const isGoogleSheetsNode = !isGoogleSheetsTriggerNode && (selectedNode.type.toLowerCase().includes('googlesheets') || selectedNode.type.startsWith('googleSheets'));
  const isOpenAiGenerateTextNode = selectedNode.type === 'openaiGenerateText' || selectedNode.type === 'openAiGenerateText' || (selectedNode.type.toLowerCase().includes('openai') && selectedNode.type.toLowerCase().includes('generatetext'));
  const isGeminiGenerateTextNode = selectedNode.type === 'geminiGenerateText' || selectedNode.type === 'googleGeminiGenerateText' || (selectedNode.type.toLowerCase().includes('gemini') && selectedNode.type.toLowerCase().includes('generatetext'));
  const isAiGenerateTextNode = !isOpenAiGenerateTextNode && !isGeminiGenerateTextNode && (selectedNode.type === 'aiGenerateText' || selectedNode.type === 'ai' || (selectedNode.type.toLowerCase().includes('ai') && selectedNode.type.toLowerCase().includes('generatetext')));
  const isDiscordMessageReceivedNode = selectedNode.type === 'discordMessageReceived' || selectedNode.type === 'discordMessageReceivedTrigger' || (selectedNode.type.toLowerCase().includes('discord') && selectedNode.type.toLowerCase().includes('messagereceived'));
  const isDiscordCreateChannelNode = selectedNode.type === 'discordCreateChannel' || (selectedNode.type.toLowerCase().includes('discord') && selectedNode.type.toLowerCase().includes('createchannel'));
  const isDiscordDeleteChannelNode = selectedNode.type === 'discordDeleteChannel' || (selectedNode.type.toLowerCase().includes('discord') && selectedNode.type.toLowerCase().includes('deletechannel'));
  const isDiscordCreateRoleNode = selectedNode.type === 'discordCreateRole' || (selectedNode.type.toLowerCase().includes('discord') && selectedNode.type.toLowerCase().includes('createrole'));
  const isDiscordDeleteRoleNode = selectedNode.type === 'discordDeleteRole' || (selectedNode.type.toLowerCase().includes('discord') && selectedNode.type.toLowerCase().includes('deleterole'));
  const isDiscordAddRoleToMemberNode = selectedNode.type === 'discordAddRoleToMember' || (selectedNode.type.toLowerCase().includes('discord') && selectedNode.type.toLowerCase().includes('addroletomember'));
  const isDiscordRemoveRoleFromMemberNode = selectedNode.type === 'discordRemoveRoleFromMember' || (selectedNode.type.toLowerCase().includes('discord') && selectedNode.type.toLowerCase().includes('removerolefrommember'));
  const isDiscordEmbedNode = !isDiscordMessageReceivedNode && !isDiscordCreateChannelNode && !isDiscordDeleteChannelNode && !isDiscordCreateRoleNode && !isDiscordDeleteRoleNode && !isDiscordAddRoleToMemberNode && !isDiscordRemoveRoleFromMemberNode && (selectedNode.type === 'discordSendEmbed' || selectedNode.type === 'discordEmbed' || (selectedNode.type.toLowerCase().includes('discord') && selectedNode.type.toLowerCase().includes('embed')));
  const isDiscordNode = !isDiscordMessageReceivedNode && !isDiscordCreateChannelNode && !isDiscordDeleteChannelNode && !isDiscordCreateRoleNode && !isDiscordDeleteRoleNode && !isDiscordAddRoleToMemberNode && !isDiscordRemoveRoleFromMemberNode && !isDiscordEmbedNode && (selectedNode.type === 'discordSendMessage' || selectedNode.type === 'discord' || selectedNode.type.toLowerCase().includes('discord'));




  return (
    <WorkflowBuilderProvider
      workflowNodes={workflowNodes}
      executionSnapshot={executionSnapshot}
      updateNodeData={onUpdateNodeData}
      workflowId={workflowId}
    >
      <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full select-none shadow-xl text-slate-900">
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg border ${registryEntry.badgeColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Node Properties
              </h3>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                {registryEntry.category || 'NODE'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Controls Body */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Visual Data Mapper Engine Trigger */}
          <button
            type="button"
            onClick={() => setShowDataMapper(true)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-semibold transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
              <span>Variables & Data Explorer</span>
            </div>
            <span className="text-[10px] font-mono bg-white border border-orange-200 px-2 py-0.5 rounded-md text-orange-700 font-bold">
              EXPLORE
            </span>
          </button>

          {/* Node Validation Status Banner */}
          {!isGmailNode && !isWebhookNode && (
            !validationResult.isValid ? (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-bold block">Incomplete Configuration</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90">
                    {Array.isArray(validationResult.errors) ? (
                      validationResult.errors.map((err, idx) => <li key={idx}>{err}</li>)
                    ) : (
                      Object.values(validationResult.errors).map((err, idx) => <li key={idx}>{err}</li>)
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-bold">Valid Node Configuration</span>
              </div>
            )
          )}

          {/* Node Custom Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Step Label
            </label>
            <input
              type="text"
              value={selectedNode.data?.label || ''}
              onChange={handleLabelChange}
              placeholder="Enter node label..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all shadow-inner"
            />
          </div>

          {/* Configuration Parameter Panel */}
          <div className="pt-3 border-t border-slate-100 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Configuration Parameters
            </h4>

            {isFileUploadNode ? (
              <FileUploadProperties
                node={selectedNode}
                onUpdateNodeData={onUpdateNodeData}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isDocumentExtractNode ? (
              <DocumentExtractProperties
                node={selectedNode}
                onUpdateNodeData={onUpdateNodeData}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isWebsiteConnectNode ? (
              <WebsiteConnectProperties
                node={selectedNode}
                onUpdateNodeData={onUpdateNodeData}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isGeminiStructureProductsNode ? (
              <GeminiStructureProductsProperties
                node={selectedNode}
                nodeData={selectedNode.data}
                onUpdateNodeData={onUpdateNodeData}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isForEachProductNode ? (
              <ForEachProductProperties
                node={selectedNode}
                nodeData={selectedNode.data}
                onUpdateNodeData={onUpdateNodeData}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isWebsiteCreateProductNode ? (
              <WebsiteCreateProductProperties
                node={selectedNode}
                nodeData={selectedNode.data}
                onUpdateNodeData={onUpdateNodeData}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isWebsiteCreateTournamentNode ? (
              <WebsiteCreateTournamentProperties
                node={selectedNode}
                onUpdateNode={(updatedNode) => {
                  onUpdateNodeData(selectedNode.id, updatedNode.data);
                }}
              />
            ) : isGeminiStructureTournamentNode ? (
              <GeminiStructureTournamentProperties
                node={selectedNode}
                nodeData={selectedNode.data}
                onUpdateNodeData={onUpdateNodeData}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isForEachTournamentNode ? (
              <ForEachTournamentProperties
                node={selectedNode}
                nodeData={selectedNode.data}
                onUpdateNodeData={onUpdateNodeData}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isGmailNode ? (
              <GmailProperties
                node={selectedNode}
                onUpdateNodeData={onUpdateNodeData}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isConditionNode ? (
              <ConditionProperties
                node={selectedNode}
                onUpdateNodeData={onUpdateNodeData}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isWebhookNode ? (
              <WebhookProperties
                node={selectedNode}
                onUpdateNodeData={onUpdateNodeData}
                workflowId={workflowId}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isCronNode ? (
              <CronProperties
                node={selectedNode}
                onUpdateNodeData={onUpdateNodeData}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isMongoCrudNode ? (
              <MongoCrudProperties
                node={selectedNode}
                onUpdateNodeData={onUpdateNodeData}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isMongoConnNode ? (
              <MongoDBConnectionProperties
                nodeData={selectedNode.data}
                onUpdateNodeConfig={(nextConfig) => onUpdateNodeData(selectedNode.id, { config: nextConfig })}
              />
            ) : isPdfNode ? (
              <PdfGeneratorProperties
                node={selectedNode}
                onUpdateNodeData={onUpdateNodeData}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isGoogleSheetsTriggerNode ? (
              <GoogleSheetsTriggerProperties
                node={selectedNode}
                nodeType={selectedNode.type}
                nodeData={selectedNode.data}
                workflowId={workflowId}
                onUpdateNodeData={onUpdateNodeData}
                onUpdateNodeConfig={(nextConfig) => onUpdateNodeData(selectedNode.id, { config: nextConfig })}
              />
            ) : isGoogleSheetsNode ? (
              <GoogleSheetsProperties
                node={selectedNode}
                nodeType={selectedNode.type}
                nodeData={selectedNode.data}
                onUpdateNodeData={onUpdateNodeData}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isOpenAiGenerateTextNode ? (
              <OpenAiGenerateTextProperties
                nodeData={selectedNode.data}
                onUpdateConfig={(nextConfig) => onUpdateNodeData(selectedNode.id, { config: nextConfig })}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isGeminiGenerateTextNode ? (
              <GeminiGenerateTextProperties
                nodeData={selectedNode.data}
                onUpdateConfig={(nextConfig) => onUpdateNodeData(selectedNode.id, { config: nextConfig })}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isAiGenerateTextNode ? (
              <AiGenerateTextProperties
                nodeData={selectedNode.data}
                onUpdateConfig={(nextConfig) => onUpdateNodeData(selectedNode.id, { config: nextConfig })}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
              />
            ) : isDiscordMessageReceivedNode ? (
              <DiscordMessageReceivedProperties
                nodeData={selectedNode.data}
                onUpdateConfig={(nextConfig) => onUpdateNodeData(selectedNode.id, { config: nextConfig })}
              />
            ) : isDiscordCreateChannelNode ? (
              <DiscordCreateChannelProperties
                nodeData={selectedNode.data}
                onUpdateConfig={(nextConfig) => onUpdateNodeData(selectedNode.id, { config: nextConfig })}
              />
            ) : isDiscordDeleteChannelNode ? (
              <DiscordDeleteChannelProperties
                nodeData={selectedNode.data}
                onUpdateConfig={(nextConfig) => onUpdateNodeData(selectedNode.id, { config: nextConfig })}
              />
            ) : isDiscordCreateRoleNode ? (
              <DiscordCreateRoleProperties
                nodeData={selectedNode.data}
                onUpdateConfig={(nextConfig) => onUpdateNodeData(selectedNode.id, { config: nextConfig })}
              />
            ) : isDiscordDeleteRoleNode ? (
              <DiscordDeleteRoleProperties
                nodeData={selectedNode.data}
                onUpdateConfig={(nextConfig) => onUpdateNodeData(selectedNode.id, { config: nextConfig })}
              />
            ) : isDiscordAddRoleToMemberNode ? (
              <DiscordAddRoleToMemberProperties
                nodeData={selectedNode.data}
                onUpdateConfig={(nextConfig) => onUpdateNodeData(selectedNode.id, { config: nextConfig })}
              />
            ) : isDiscordRemoveRoleFromMemberNode ? (
              <DiscordRemoveRoleFromMemberProperties
                nodeData={selectedNode.data}
                onUpdateConfig={(nextConfig) => onUpdateNodeData(selectedNode.id, { config: nextConfig })}
              />
            ) : isDiscordEmbedNode ? (
              <DiscordEmbedProperties
                nodeData={selectedNode.data}
                onUpdateConfig={(nextConfig) => onUpdateNodeData(selectedNode.id, { config: nextConfig })}
              />
            ) : isDiscordNode ? (
              <DiscordProperties
                nodeData={selectedNode.data}
                onUpdateConfig={(nextConfig) => onUpdateNodeData(selectedNode.id, { config: nextConfig })}
              />
            ) : (
              <AutoForm
                schema={registryEntry.schema}
                data={selectedNode.data?.config || {}}
                workflowNodes={workflowNodes}
                executionSnapshot={executionSnapshot}
                onChange={(newConfig) =>
                  onUpdateNodeData(selectedNode.id, { config: newConfig })
                }
              />
            )}
          </div>
        </div>

        {/* Panel Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteNode(selectedNode.id)}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete Node
          </Button>

          <span className="text-[10px] font-mono text-slate-500">
            ID: {selectedNode.id}
          </span>
        </div>
      </aside>

      {/* Visual Data Mapper Overlay */}
      {showDataMapper && (
        <DataMapperPanel
          currentNode={selectedNode}
          workflowNodes={workflowNodes}
          executionSnapshot={executionSnapshot}
          onClose={() => setShowDataMapper(false)}
          onApplyMapping={(targetField, expression) => {
            const currentConfig = selectedNode.data?.config || {};
            onUpdateNodeData(selectedNode.id, {
              config: { ...currentConfig, [targetField]: expression },
            });
            setShowDataMapper(false);
          }}
        />
      )}
    </WorkflowBuilderProvider>
  );
};

export default PropertiesPanel;
