import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Wand2,
  Rocket,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  FileCode,
  Layers,
  Code,
  Zap,
  Bot
} from 'lucide-react';
import { aiService } from '../services/aiService';
import toast from 'react-hot-toast';

const SAMPLE_PROMPTS = [
  {
    title: 'User Signup Welcome Flow',
    prompt: 'When a user signs up, send a welcome email, wait 5 minutes, send a Slack notification, then log the result.',
  },
  {
    title: 'Daily Weather Alert (Cron)',
    prompt: 'Every day at 9 AM fetch weather data from open meteo API and send a Telegram message to chat.',
  },
  {
    title: 'E-commerce Payment Receipt',
    prompt: 'When payment succeeds, create invoice, send Gmail to customer, notify Discord channel.',
  },
  {
    title: 'CRM Lead Router (Condition)',
    prompt: 'When a lead submits form, check if email exists. If yes, send Gmail welcome email, otherwise log event.',
  },
];

export const AIBuilderPage = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async (customPrompt) => {
    const textToUse = customPrompt || prompt;
    if (!textToUse.trim()) {
      toast.error('Please enter an automation prompt');
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const res = await aiService.generateWorkflow(textToUse.trim());
      setResult(res);
      toast.success(`✨ Workflow "${res.name || 'AI Generated'}" ready!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenInBuilder = () => {
    if (!result?.workflow?._id) {
      toast.error('Workflow document missing');
      return;
    }
    navigate(`/builder/${result.workflow._id}`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none font-sans text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/15 border border-indigo-500/25 text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              AI Natural Language Workflow Builder
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Describe your desired automation process in plain English. AutomateX AI will construct nodes, handles, connections, and variables instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Main Prompt Input Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-indigo-400" /> Describe Your Automation Workflow
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="e.g. When a new user signs up, send a welcome email, wait 5 minutes, send a Slack message, and log output..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Quick Sample Prompts */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Quick Template Inspiration
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(sample.prompt);
                  handleGenerate(sample.prompt);
                }}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 text-left transition-all group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                  <span>{sample.title}</span>
                  <Zap className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{sample.prompt}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => handleGenerate()}
            disabled={generating || !prompt.trim()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all shadow-xl shadow-indigo-600/25 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Grok AI Engine Generating Graph...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Generate Workflow</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Generated Result Preview Card */}
      {result && (
        <div className="bg-slate-900 border border-indigo-500/30 bg-indigo-500/5 rounded-2xl p-6 shadow-2xl space-y-5">
          {/* Card Header */}
          <div className="flex items-start justify-between border-b border-indigo-500/20 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                  {result.provider === 'grok' ? '✨ GROK AI' : '⚡ HEURISTIC AI'}
                </span>
                <h3 className="text-sm font-bold text-white">{result.name}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">{result.description}</p>
            </div>

            {result.workflow?._id && (
              <button
                onClick={handleOpenInBuilder}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
              >
                <span>Open in Canvas Builder</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Generated Node Sequence Pipeline */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Generated Graph Structure ({result.definition?.nodes?.length || 0} Nodes)
            </h4>
            <div className="flex items-center gap-2 overflow-x-auto p-3 rounded-xl bg-slate-950 border border-slate-800 custom-scrollbar">
              {(result.definition?.nodes || []).map((node, i) => (
                <React.Fragment key={node.id}>
                  <div className="px-3 py-2 rounded-lg bg-slate-900 border border-indigo-500/30 text-xs font-semibold text-slate-200 flex items-center gap-2 flex-shrink-0">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 font-mono text-[10px] flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span>{node.data?.label || node.type}</span>
                    <span className="text-[9px] font-mono text-slate-500 px-1 py-0.5 rounded bg-slate-950">
                      {node.type}
                    </span>
                  </div>
                  {i < result.definition.nodes.length - 1 && (
                    <span className="text-slate-600 font-mono font-bold flex-shrink-0">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Explanation Summary */}
          {result.summary && (
            <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-indigo-400" /> AI Step-By-Step Breakdown
              </h4>
              <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                {result.summary}
              </pre>
            </div>
          )}

          {/* Warnings */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Note / Suggestions
              </div>
              {result.warnings.map((w, idx) => (
                <p key={idx} className="text-[11px] text-amber-300/80">• {w}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIBuilderPage;
