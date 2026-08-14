import React, { useState, useEffect } from 'react';
import { Sparkles, Key, Layers, FileText, Info } from 'lucide-react';
import api from '../../../../services/api';

export const GeminiStructureProductsProperties = ({
  node,
  nodeData,
  onUpdateNodeData,
  onUpdateConfig,
}) => {
  const config = node?.data?.config || nodeData?.config || {};

  const updateConfig = (newConfig) => {
    if (onUpdateNodeData && node?.id) {
      onUpdateNodeData(node.id, { config: newConfig });
    } else if (onUpdateConfig) {
      onUpdateConfig(newConfig);
    }
  };

  const [credentialId, setCredentialId] = useState(config.credentialId || '');
  const [documentText, setDocumentText] = useState(config.documentText || '{{steps["Document → Extract Content"].content.text}}');
  const [model, setModel] = useState(config.model || 'gemini-1.5-flash');
  const [temperature, setTemperature] = useState(config.temperature !== undefined ? config.temperature : 0.1);
  const [credentials, setCredentials] = useState([]);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await api.get('/credentials');
      if (res.data?.success) {
        const geminiCreds = (res.data.credentials || []).filter(
          (c) => c.provider === 'gemini' || c.provider === 'google' || c.type === 'ai'
        );
        setCredentials(geminiCreds);
      }
    } catch (e) {
      console.warn('[GeminiStructureProductsProperties] Could not fetch credentials:', e.message);
    }
  };

  const handleChange = (key, value) => {
    if (key === 'credentialId') setCredentialId(value);
    if (key === 'documentText') setDocumentText(value);
    if (key === 'model') setModel(value);
    if (key === 'temperature') setTemperature(value);

    updateConfig({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4 text-slate-200">
      <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-semibold text-purple-300">Multi-Product Auto-Detection</p>
          <p className="text-[11px] text-purple-200/70 mt-0.5">
            Detects multiple product boundaries in raw document text and extracts clean, validated JSON schemas with zero hallucination.
          </p>
        </div>
      </div>

      {/* AI Credential Selection */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
          <span>Gemini AI Credential</span>
          <span className="text-[10px] text-slate-500">Optional (Uses env key by default)</span>
        </label>
        <select
          value={credentialId}
          onChange={(e) => handleChange('credentialId', e.target.value)}
          className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500"
        >
          <option value="">-- Use Default / System Gemini API Key --</option>
          {credentials.map((c) => (
            <option key={c.id || c._id} value={c.id || c._id}>
              {c.name} ({c.provider || 'gemini'})
            </option>
          ))}
        </select>
      </div>

      {/* Document Text Source */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-300">Document Text Expression *</label>
        <textarea
          rows={3}
          value={documentText}
          onChange={(e) => handleChange('documentText', e.target.value)}
          placeholder='{{steps["Document → Extract Content"].content.text}}'
          className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md p-2.5 text-slate-200 font-mono focus:outline-none focus:border-purple-500"
        />
        <p className="text-[10px] text-slate-500">
          Expression referencing previous step or raw document text.
        </p>
      </div>

      {/* Gemini Model */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Model</label>
          <select
            value={model}
            onChange={(e) => handleChange('model', e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-purple-500"
          >
            <option value="gemini-1.5-flash">gemini-1.5-flash</option>
            <option value="gemini-2.0-flash">gemini-2.0-flash</option>
            <option value="gemini-1.5-pro">gemini-1.5-pro</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Temperature</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={temperature}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Downstream Variable Explorer Info */}
      <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg space-y-1.5 text-xs">
        <p className="font-semibold text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-purple-400" />
          Exposed Variables for Downstream Steps
        </p>
        <div className="space-y-1 font-mono text-[10px] text-purple-300">
          <div>• <code>{'{{steps["Gemini → Structure Products"].products}}'}</code> (Array of all product objects)</div>
          <div>• <code>{'{{steps["Gemini → Structure Products"].count}}'}</code> (Total detected product count)</div>
        </div>
      </div>
    </div>
  );
};
