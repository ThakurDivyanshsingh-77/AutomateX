import React, { useState, useEffect } from 'react';
import { credentialService } from '../../credentials/services/credentialService';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { OpenAiIcon } from './OpenAiIcon';
import { Loader2, AlertCircle, CheckCircle2, Copy, Check, Sliders, Sparkles } from 'lucide-react';

const OPENAI_MODELS = [
  { value: 'gpt-4o-mini', label: 'gpt-4o-mini (Recommended - Fast & Cost Effective)' },
  { value: 'gpt-4o', label: 'gpt-4o (High Intelligence Flagship)' },
  { value: 'gpt-4-turbo', label: 'gpt-4-turbo (Complex Multimodal)' },
  { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo (Legacy Speed)' },
  { value: 'o3-mini', label: 'o3-mini (STEM Reasoning Model)' },
  { value: 'custom', label: 'Custom Model Identifier...' },
];

export const OpenAiGenerateTextProperties = ({ nodeData, onUpdateConfig }) => {
  const config = nodeData?.config || nodeData?.data || {};

  const [credentials, setCredentials] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [credError, setCredError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const [credentialId, setCredentialId] = useState(config.credentialId || '');
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
    fetchOpenAiCredentials();
  }, []);

  const fetchOpenAiCredentials = async () => {
    setLoadingCreds(true);
    setCredError('');
    try {
      const res = await credentialService.getCredentials();
      const allCreds = res.data || [];
      // Strictly filter ONLY OpenAI credentials
      const openAiCreds = allCreds.filter((c) => c.service === 'openai');
      setCredentials(openAiCreds);

      if (openAiCreds.length > 0) {
        const exists = openAiCreds.some((c) => c._id === credentialId);
        if (!credentialId || !exists) {
          const firstId = openAiCreds[0]._id;
          setCredentialId(firstId);
          updateConfigField('credentialId', firstId);
        }
      }
    } catch (err) {
      console.warn('[OpenAiGenerateTextProperties] Failed to load credentials:', err);
      setCredError(err.response?.data?.message || 'Failed to load OpenAI credentials from vault');
    } finally {
      setLoadingCreds(false);
    }
  };

  const updateConfigField = (field, val) => {
    const activeModel = model === 'custom' ? customModel : model;
    const updated = {
      ...config,
      credentialId,
      provider: 'openai',
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
    if (!credentialId) return toast.error('OpenAI credential is required.');
    if (!prompt.trim()) return toast.error('Prompt cannot be empty.');

    const activeModel = model === 'custom' ? customModel : model;
    if (!activeModel.trim()) return toast.error('OpenAI model is required.');

    setTesting(true);
    setTestResult(null);

    try {
      const res = await api.post('/ai/generate-text', {
        credentialId,
        provider: 'openai',
        model: activeModel,
        prompt: prompt.trim(),
        temperature: parseFloat(temperature) || 0.7,
        maxTokens: parseInt(maxTokens, 10) || 500,
      });

      if (res.data.success) {
        setTestResult(res.data);
        toast.success('OpenAI Text Generated Successfully!');
      } else {
        toast.error(res.data.message || 'OpenAI request failed.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'OpenAI request failed. Please check the model and request configuration.';
      toast.error(errMsg);
    } finally {
      setTesting(false);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied OpenAI output to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 text-xs font-sans select-none">
      {/* Header Banner with official OpenAI Branding */}
      <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <OpenAiIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs leading-none">OpenAI</h4>
            <p className="text-[10px] text-emerald-400 mt-0.5">Generate Text</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          v1/chat/completions
        </span>
      </div>

      {credError && (
        <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{credError}</span>
        </div>
      )}

      {/* 1. OpenAI Credential Picker */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">
          OpenAI Credential <span className="text-rose-400">*</span>
        </label>
        {loadingCreds ? (
          <div className="flex items-center gap-2 text-slate-400 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Loading OpenAI credentials...</span>
          </div>
        ) : credentials.length === 0 ? (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
            <p className="text-slate-300 font-medium">No OpenAI credentials found.</p>
            <p className="text-[11px] text-emerald-400">Add an OpenAI credential under Credentials first.</p>
          </div>
        ) : (
          <select
            value={credentialId}
            onChange={(e) => {
              const val = e.target.value;
              setCredentialId(val);
              updateConfigField('credentialId', val);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="">[ Select OpenAI Credential ]</option>
            {credentials.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.maskedValue})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 2. Model Selector */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">
          Model <span className="text-rose-400">*</span>
        </label>
        <select
          value={model}
          onChange={(e) => {
            const val = e.target.value;
            setModel(val);
            updateConfigField('model', val === 'custom' ? customModel : val);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
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
            placeholder="Enter OpenAI model identifier (e.g. gpt-4o)"
            value={customModel}
            onChange={(e) => {
              const val = e.target.value;
              setCustomModel(val);
              updateConfigField('model', val);
            }}
            className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
          />
        )}
      </div>

      {/* 3. Prompt Textarea */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">
            Prompt <span className="text-rose-400">*</span>
          </label>
          <span className="text-[10px] font-mono text-slate-500">
            {prompt.length} chars
          </span>
        </div>
        <textarea
          rows={5}
          placeholder="Write your prompt here..."
          value={prompt}
          onChange={(e) => {
            const val = e.target.value;
            setPrompt(val);
            updateConfigField('prompt', val);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
        />
        <p className="text-[10px] text-slate-500 italic">
          Supports AutomateX dynamic variables like <code className="text-emerald-400 font-mono">{`{{projectName}}`}</code> or <code className="text-emerald-400 font-mono">{`{{steps["Previous Node"].text}}`}</code>.
        </p>
      </div>

      {/* 4. Temperature & Max Tokens Settings */}
      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs border-b border-slate-800 pb-1.5">
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Model Parameters</span>
        </div>

        {/* Temperature */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="text-slate-300">Temperature</label>
            <span className="font-mono text-emerald-300 text-[11px] font-bold">{temperature}</span>
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
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
          <p className="text-[10px] text-slate-500">
            Default 0.7 (Range 0 - 2).
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
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Test Execution Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleTestGenerate}
          disabled={testing || !credentialId || !prompt.trim()}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20 cursor-pointer"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <OpenAiIcon className="w-4 h-4" />
              <span>Test Generate</span>
            </>
          )}
        </button>
      </div>

      {/* Test Execution Result Display */}
      {testResult && testResult.success && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-emerald-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>OpenAI Output</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyText(testResult.text)}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] bg-emerald-900/40 hover:bg-emerald-900/60 px-2 py-0.5 rounded transition-colors cursor-pointer"
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
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-emerald-500/20">
              <div>Model: <span className="text-emerald-300 font-semibold">{testResult.model}</span></div>
              <div>
                Tokens: <span className="text-white font-bold">{testResult.usage.totalTokens ?? 'N/A'}</span>
                {testResult.usage.promptTokens !== null && (
                  <span className="text-slate-500 ml-1">
                    ({testResult.usage.promptTokens} prompt / {testResult.usage.completionTokens} completion)
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

export default OpenAiGenerateTextProperties;
