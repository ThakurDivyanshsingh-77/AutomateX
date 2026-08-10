import React, { useState, useEffect } from 'react';
import { credentialService } from '../../credentials/services/credentialService';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Sparkles, Loader2, AlertCircle, CheckCircle2, Copy, Check, Sliders, Zap } from 'lucide-react';

const OPENAI_MODELS = [
  { value: 'gpt-4o-mini', label: 'gpt-4o-mini (Recommended - Fast & Affordable)' },
  { value: 'gpt-4o', label: 'gpt-4o (High Intelligence Flagship)' },
  { value: 'gpt-4-turbo', label: 'gpt-4-turbo (Complex Multimodal)' },
  { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo (Legacy Speed)' },
  { value: 'o3-mini', label: 'o3-mini (STEM Reasoning Model)' },
  { value: 'custom', label: 'Custom Model Name...' },
];

export const AiGenerateTextProperties = ({ nodeData, onUpdateConfig }) => {
  const config = nodeData?.config || nodeData?.data || {};

  const [credentials, setCredentials] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [credError, setCredError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const [credentialId, setCredentialId] = useState(config.credentialId || '');
  const [provider, setProvider] = useState(config.provider || 'openai');
  const [model, setModel] = useState(config.model || 'gpt-4o-mini');
  const [customModel, setCustomModel] = useState(
    OPENAI_MODELS.some((m) => m.value === config.model) ? '' : config.model || ''
  );
  const [prompt, setPrompt] = useState(config.prompt || '');
  const [temperature, setTemperature] = useState(
    config.temperature !== undefined ? config.temperature : 0.7
  );
  const [maxTokens, setMaxTokens] = useState(
    config.maxTokens !== undefined ? config.maxTokens : 500
  );

  useEffect(() => {
    fetchAiCredentials();
  }, []);

  const fetchAiCredentials = async () => {
    setLoadingCreds(true);
    setCredError('');
    try {
      const res = await credentialService.getCredentials();
      const allCreds = res.data || [];
      const aiCreds = allCreds.filter(
        (c) => c.service === 'openai' || c.service === 'custom' || c.authType === 'apiKey'
      );
      setCredentials(aiCreds);

      if (aiCreds.length > 0) {
        const exists = aiCreds.some((c) => c._id === credentialId);
        if (!credentialId || !exists) {
          const firstId = aiCreds[0]._id;
          setCredentialId(firstId);
          updateConfigField('credentialId', firstId);
        }
      }
    } catch (err) {
      console.warn('[AiGenerateTextProperties] Failed to load credentials:', err);
      setCredError(err.response?.data?.message || 'Failed to load AI credentials from vault');
    } finally {
      setLoadingCreds(false);
    }
  };

  const updateConfigField = (field, val) => {
    const activeModel = model === 'custom' ? customModel : model;
    const updated = {
      ...config,
      credentialId,
      provider,
      model: field === 'model' && val !== 'custom' ? val : activeModel,
      prompt,
      temperature,
      maxTokens,
      [field]: val,
    };
    if (onUpdateConfig) {
      onUpdateConfig(updated);
    }
  };

  const handleTestGenerate = async () => {
    if (!credentialId) return toast.error('Please select an AI Credential');
    if (!prompt.trim()) return toast.error('Please enter a prompt');

    const activeModel = model === 'custom' ? customModel : model;
    if (!activeModel.trim()) return toast.error('Please select or specify an AI model');

    setTesting(true);
    setTestResult(null);

    try {
      const res = await api.post('/ai/generate-text', {
        credentialId,
        provider,
        model: activeModel,
        prompt: prompt.trim(),
        temperature: parseFloat(temperature) || 0.7,
        maxTokens: parseInt(maxTokens, 10) || 500,
      });

      if (res.data.success) {
        setTestResult(res.data);
        toast.success(`AI Text Generated Successfully!`);
      } else {
        toast.error(res.data.message || 'Failed to generate text');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to generate text from AI provider';
      toast.error(errMsg);
    } finally {
      setTesting(false);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied AI text to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 text-xs font-sans select-none">
      {/* Header Banner */}
      <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-white text-xs">AI → Generate Text</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
          OpenAI LLM
        </span>
      </div>

      {credError && (
        <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{credError}</span>
        </div>
      )}

      {/* 1. AI Credential Picker */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">
          AI Credential <span className="text-rose-400">*</span>
        </label>
        {loadingCreds ? (
          <div className="flex items-center gap-2 text-slate-400 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
            <span>Loading AI credentials...</span>
          </div>
        ) : credentials.length === 0 ? (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
            <p>No AI credentials found.</p>
            <p className="text-[11px] text-purple-400">Add an OpenAI credential under Credentials page first.</p>
          </div>
        ) : (
          <select
            value={credentialId}
            onChange={(e) => {
              const val = e.target.value;
              setCredentialId(val);
              updateConfigField('credentialId', val);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer"
          >
            <option value="">-- Select AI Credential --</option>
            {credentials.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.maskedValue})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 2. AI Provider */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">
          AI Provider <span className="text-rose-400">*</span>
        </label>
        <select
          value={provider}
          onChange={(e) => {
            const val = e.target.value;
            setProvider(val);
            updateConfigField('provider', val);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer"
        >
          <option value="openai">OpenAI</option>
        </select>
      </div>

      {/* 3. Model Selector */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">
          AI Model <span className="text-rose-400">*</span>
        </label>
        <select
          value={model}
          onChange={(e) => {
            const val = e.target.value;
            setModel(val);
            updateConfigField('model', val === 'custom' ? customModel : val);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer"
        >
          {OPENAI_MODELS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {model === 'custom' && (
          <input
            type="text"
            placeholder="Enter model identifier (e.g. gpt-4o)"
            value={customModel}
            onChange={(e) => {
              const val = e.target.value;
              setCustomModel(val);
              updateConfigField('model', val);
            }}
            className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
          />
        )}
      </div>

      {/* 4. Prompt Textarea */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">
            Prompt <span className="text-rose-400">*</span>
          </label>
          <span className="text-[10px] font-mono text-slate-500">
            {prompt.length} / 8000 chars
          </span>
        </div>
        <textarea
          rows={5}
          placeholder="e.g. Write a professional Discord announcement for {{workflow.name}}."
          value={prompt}
          onChange={(e) => {
            const val = e.target.value;
            setPrompt(val);
            updateConfigField('prompt', val);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
        />
        <p className="text-[10px] text-slate-500 italic">
          Supports AutomateX dynamic variables like <code className="text-purple-400 font-mono">{`{{steps["Previous Node"].text}}`}</code> or <code className="text-purple-400 font-mono">{`{{workflow.name}}`}</code>.
        </p>
      </div>

      {/* 5. Temperature & Max Tokens (Collapsible / Grid) */}
      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs border-b border-slate-800 pb-1.5">
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          <span>Advanced Model Parameters</span>
        </div>

        {/* Temperature */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="text-slate-300">Temperature</label>
            <span className="font-mono text-purple-300 text-[11px] font-bold">{temperature}</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setTemperature(val);
                updateConfigField('temperature', val);
              }}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
          <p className="text-[10px] text-slate-500">
            0.0 = Deterministic/Focused, 0.7 = Balanced, 1.5+ = Creative/Random.
          </p>
        </div>

        {/* Max Tokens */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="text-slate-300">Max Tokens</label>
            <span className="font-mono text-slate-400 text-[11px]">{maxTokens} tokens</span>
          </div>
          <input
            type="number"
            min="1"
            max="128000"
            value={maxTokens}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10) || 500;
              setMaxTokens(val);
              updateConfigField('maxTokens', val);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Test Execution Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleTestGenerate}
          disabled={testing || !credentialId || !prompt.trim()}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 cursor-pointer"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating AI Text...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Test Generate</span>
            </>
          )}
        </button>
      </div>

      {/* Test Execution Result Display */}
      {testResult && testResult.success && (
        <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-purple-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Generated Response</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyText(testResult.text)}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] bg-purple-900/40 hover:bg-purple-900/60 px-2 py-0.5 rounded transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Generated Text Box */}
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
            {testResult.text}
          </div>

          {/* Usage Stats */}
          {testResult.usage && (
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-purple-500/20">
              <div>Model: <span className="text-purple-300 font-semibold">{testResult.model}</span></div>
              <div>
                Tokens: <span className="text-white font-bold">{testResult.usage.totalTokens ?? 'N/A'}</span>
                {testResult.usage.promptTokens !== null && (
                  <span className="text-slate-500 ml-1">
                    ({testResult.usage.promptTokens} in / {testResult.usage.completionTokens} out)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiGenerateTextProperties;
