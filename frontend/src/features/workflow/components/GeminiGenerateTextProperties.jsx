import React, { useState, useEffect } from 'react';
import { credentialService } from '../../credentials/services/credentialService';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { GeminiIcon } from './GeminiIcon';
import { Loader2, AlertCircle, CheckCircle2, Copy, Check, Sliders } from 'lucide-react';

const GEMINI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash (Recommended - Next-Gen Fast)' },
  { value: 'gemini-2.0-flash', label: 'gemini-2.0-flash (High Performance & Speed)' },
  { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro (Complex Reasoning Flagship)' },
  { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash (Fast & Cost Effective)' },
  { value: 'custom', label: 'Custom Model Identifier...' },
];

export const GeminiGenerateTextProperties = ({ nodeData, onUpdateConfig }) => {
  const config = nodeData?.config || nodeData?.data || {};

  const [credentials, setCredentials] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [credError, setCredError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const [credentialId, setCredentialId] = useState(config.credentialId || '');
  const [model, setModel] = useState(config.model || 'gemini-2.5-flash');
  const [customModel, setCustomModel] = useState(
    GEMINI_MODELS.some((m) => m.value === config.model) ? '' : config.model || ''
  );
  const [prompt, setPrompt] = useState(config.prompt || '');
  const [temperature, setTemperature] = useState(
    config.temperature !== undefined ? config.temperature : 0.7
  );
  const [maxTokens, setMaxTokens] = useState(
    config.maxTokens !== undefined ? config.maxTokens : 500
  );

  useEffect(() => {
    fetchGeminiCredentials();
  }, []);

  const fetchGeminiCredentials = async () => {
    setLoadingCreds(true);
    setCredError('');
    try {
      const res = await credentialService.getCredentials();
      const allCreds = res.data || [];
      // Filter ONLY Gemini credentials (or google service fallback)
      const geminiCreds = allCreds.filter((c) => c.service === 'gemini' || c.service === 'google');
      setCredentials(geminiCreds);

      if (geminiCreds.length > 0) {
        const exists = geminiCreds.some((c) => c._id === credentialId);
        if (!credentialId || !exists) {
          const firstId = geminiCreds[0]._id;
          setCredentialId(firstId);
          updateConfigField('credentialId', firstId);
        }
      }
    } catch (err) {
      console.warn('[GeminiGenerateTextProperties] Failed to load credentials:', err);
      setCredError(err.response?.data?.message || 'Failed to load Gemini credentials from vault');
    } finally {
      setLoadingCreds(false);
    }
  };

  const updateConfigField = (field, val) => {
    const activeModel = model === 'custom' ? customModel : model;
    const updated = {
      ...config,
      credentialId,
      provider: 'gemini',
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
    if (!credentialId) return toast.error('Gemini credential is required.');
    if (!prompt.trim()) return toast.error('Prompt cannot be empty.');

    const activeModel = model === 'custom' ? customModel : model;
    if (!activeModel.trim()) return toast.error('Gemini model is required.');

    setTesting(true);
    setTestResult(null);

    try {
      const res = await api.post('/ai/generate-text', {
        credentialId,
        provider: 'gemini',
        model: activeModel,
        prompt: prompt.trim(),
        temperature: parseFloat(temperature) || 0.7,
        maxTokens: parseInt(maxTokens, 10) || 500,
      });

      if (res.data.success) {
        setTestResult(res.data);
        toast.success('Gemini Text Generated Successfully!');
      } else {
        toast.error(res.data.message || 'Gemini request failed.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Gemini request failed. Please check the model and request configuration.';
      toast.error(errMsg);
    } finally {
      setTesting(false);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied Gemini output to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 text-xs font-sans select-none">
      {/* Header Banner with official Gemini Branding */}
      <div className="p-3 bg-sky-950/40 border border-sky-500/30 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg border border-sky-500/30">
            <GeminiIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs leading-none">Google Gemini</h4>
            <p className="text-[10px] text-sky-400 mt-0.5">Generate Text</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
          v1beta REST API
        </span>
      </div>

      {credError && (
        <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{credError}</span>
        </div>
      )}

      {/* 1. Gemini Credential Picker */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">
          Gemini Credential <span className="text-rose-400">*</span>
        </label>
        {loadingCreds ? (
          <div className="flex items-center gap-2 text-slate-400 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
            <span>Loading Gemini credentials...</span>
          </div>
        ) : credentials.length === 0 ? (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
            <p className="text-slate-300 font-medium">No Gemini credentials found.</p>
            <p className="text-[11px] text-sky-400">Add a Gemini credential under Credentials first.</p>
          </div>
        ) : (
          <select
            value={credentialId}
            onChange={(e) => {
              const val = e.target.value;
              setCredentialId(val);
              updateConfigField('credentialId', val);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 focus:outline-none cursor-pointer"
          >
            <option value="">[ Select Gemini Credential ]</option>
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
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 focus:outline-none cursor-pointer"
        >
          {GEMINI_MODELS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {model === 'custom' && (
          <input
            type="text"
            placeholder="Enter Gemini model identifier (e.g. gemini-2.5-flash)"
            value={customModel}
            onChange={(e) => {
              const val = e.target.value;
              setCustomModel(val);
              updateConfigField('model', val);
            }}
            className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
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
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono leading-relaxed"
        />
        <p className="text-[10px] text-slate-500 italic">
          Supports AutomateX dynamic variables like <code className="text-sky-400 font-mono">{`{{projectName}}`}</code> or <code className="text-sky-400 font-mono">{`{{steps["Previous Node"].text}}`}</code>.
        </p>
      </div>

      {/* 4. Temperature & Max Tokens Settings */}
      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs border-b border-slate-800 pb-1.5">
          <Sliders className="w-3.5 h-3.5 text-sky-400" />
          <span>Model Parameters</span>
        </div>

        {/* Temperature */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="text-slate-300">Temperature</label>
            <span className="font-mono text-sky-300 text-[11px] font-bold">{temperature}</span>
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
              className="w-full accent-sky-500 cursor-pointer"
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
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Test Execution Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleTestGenerate}
          disabled={testing || !credentialId || !prompt.trim()}
          className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-600/20 cursor-pointer"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <GeminiIcon className="w-4 h-4" />
              <span>Test Generate</span>
            </>
          )}
        </button>
      </div>

      {/* Test Execution Result Display */}
      {testResult && testResult.success && (
        <div className="p-3 bg-sky-950/40 border border-sky-500/30 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-sky-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Gemini Output</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyText(testResult.text)}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] bg-sky-900/40 hover:bg-sky-900/60 px-2 py-0.5 rounded transition-colors cursor-pointer"
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
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-sky-500/20">
              <div>Model: <span className="text-sky-300 font-semibold">{testResult.model}</span></div>
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

export default GeminiGenerateTextProperties;
