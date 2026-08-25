import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Zap,
  Bot,
  Flame,
  AlertCircle,
  HelpCircle,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { aiService } from '../services/aiService';
import toast from 'react-hot-toast';

const SAMPLE_PROMPTS = [
  {
    title: 'Daily Activity Heartbeat (GitHub)',
    prompt: 'Every day at 9 AM commit my daily activity record to my GitHub repository.',
  },
  {
    title: 'GitHub Profile README Sync',
    prompt: 'When a new repository is created, synchronize my profile README with my projects.',
  },
  {
    title: 'Discord Live Stream Embed Alert',
    prompt: 'Every 10 minutes send my live stream link to Discord with rich embed.',
  },
  {
    title: 'Daily Weather & Gmail Report',
    prompt: 'Every morning at 9 AM send me a Gmail notification report.',
  },
  {
    title: 'Physical Action Test (Coffee)',
    prompt: 'Make me a coffee every morning.',
  },
  {
    title: 'Unsupported Test (Notion)',
    prompt: 'When a GitHub issue is opened, update my Notion page.',
  },
];

export const AIBuilderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [prompt, setPrompt] = useState(location.state?.initialPrompt || '');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (location.state?.initialPrompt) {
      setPrompt(location.state.initialPrompt);
      if (location.state?.autoGenerate) {
        handleGenerate(location.state.initialPrompt);
      }
    }
  }, [location.state]);

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
      if (res.isAutomation && res.success) {
        toast.success(`✨ Workflow "${res.name || 'AI Generated'}" ready!`);
      } else if (res.intent === 'PHYSICAL_ACTION') {
        toast.error('Physical action detected. See digital alternatives below.');
      } else if (res.intent === 'UNSUPPORTED') {
        toast.error('Unsupported integration. See available platform nodes.');
      } else if (res.intent === 'AMBIGUOUS') {
        toast('Please provide missing parameters.', { icon: 'ℹ️' });
      }
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
    <div className="space-y-6 max-w-5xl mx-auto select-none font-sans text-slate-900 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-purple-200 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 shadow-sm">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                AI Natural Language Workflow Builder 2.0
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                CAPABILITY-AWARE ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
              Describe your automation intent in plain English. AutomateX classifies feasibility, validates available platform capabilities, detects credentials, and builds deterministic execution graphs.
            </p>
          </div>
        </div>
      </div>

      {/* Main Prompt Input Area */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-purple-600" /> Describe Your Automation Workflow
            </span>
            <span className="text-[10px] text-purple-600 lowercase font-normal">zero hallucinations</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g. When a new GitHub repository is created, synchronize my profile README."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 transition-all resize-none leading-relaxed font-sans shadow-inner"
          />
        </div>

        {/* Quick Sample Prompts */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Quick Template Inspiration & Edge Cases
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(sample.prompt);
                  handleGenerate(sample.prompt);
                }}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 text-left transition-all group cursor-pointer shadow-xs hover:shadow-sm"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition-colors flex items-center justify-between">
                  <span>{sample.title}</span>
                  <Zap className="w-3 h-3 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-1">{sample.prompt}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => handleGenerate()}
            disabled={generating || !prompt.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 hover:scale-[1.01]"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Intent, Capabilities & Validation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Generate & Validate Workflow</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Generated Result or Rejection Notice */}
      {result && (
        result.isAutomation && result.success ? (
          <div className="bg-white border border-purple-200 rounded-3xl p-6 shadow-sm space-y-5">
            {/* Card Header */}
            <div className="flex items-start justify-between border-b border-purple-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    VALIDATED DAG
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{result.name}</h3>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border">
                    Score: {Math.round((result.qualityScore || 1) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{result.description}</p>
              </div>

              {result.workflow?._id && (
                <button
                  onClick={handleOpenInBuilder}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                >
                  <span>Open in Canvas Builder</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Validation Checklist Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
              {Object.entries(result.checks || {}).map(([key, val]) => (
                <div
                  key={key}
                  className={`p-2 rounded-xl border flex items-center gap-2 ${
                    val
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {val ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                  <span className="capitalize text-[11px] font-semibold">{key}</span>
                </div>
              ))}
            </div>

            {/* Generated Node Sequence Pipeline */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Planned Node Execution DAG ({result.definition?.nodes?.length || 0} Nodes)
              </h4>
              <div className="flex items-center gap-2 overflow-x-auto p-3 rounded-2xl bg-slate-50 border border-slate-200 custom-scrollbar">
                {(result.definition?.nodes || []).map((node, i) => (
                  <React.Fragment key={node.id}>
                    <div className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2.5 flex-shrink-0 shadow-xs">
                      <span className="w-5 h-5 rounded-full bg-purple-50 text-purple-600 font-mono text-[10px] flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <span>{node.data?.label || node.type}</span>
                      <span className="text-[9px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {node.type}
                      </span>
                    </div>
                    {i < result.definition.nodes.length - 1 && (
                      <span className="text-slate-400 font-mono font-bold flex-shrink-0">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Summary */}
            {result.summary && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-700">
                <Bot className="w-4 h-4 text-purple-600 shrink-0" />
                <span>{result.summary}</span>
              </div>
            )}
          </div>
        ) : (
          /* Rejection / Non-automation response */
          <div className="space-y-3">
            {result.intent === 'PHYSICAL_ACTION' && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-xs text-amber-900 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                  <Flame className="w-5 h-5 text-amber-600" />
                  <span>Physical Action Limitation</span>
                </div>
                <p className="text-xs text-amber-800/90 leading-relaxed">
                  {result.explanation || result.message}
                </p>
                {result.suggestions?.length > 0 && (
                  <div className="pt-2 border-t border-amber-200 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      Suggested Digital Alternatives:
                    </div>
                    {result.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setPrompt(sug);
                          handleGenerate(sug);
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-amber-100/50 border border-amber-200 text-xs text-amber-900 transition-colors flex items-center justify-between group cursor-pointer shadow-2xs"
                      >
                        <span>{sug}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {result.intent === 'UNSUPPORTED' && (
              <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-xs text-rose-900 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <span>Unsupported Integration</span>
                </div>
                <p className="text-xs text-rose-800/90 leading-relaxed">
                  {result.explanation || result.message}
                </p>
                {result.suggestions?.length > 0 && (
                  <div className="pt-2 border-t border-rose-200 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                      Supported Alternatives:
                    </div>
                    {result.suggestions.map((sug, i) => (
                      <div key={i} className="text-xs text-rose-800 flex items-center gap-1.5">
                        <span className="text-rose-500">•</span>
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {result.intent === 'AMBIGUOUS' && (
              <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 text-xs text-blue-900 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-800">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  <span>Clarification Needed</span>
                </div>
                <p className="text-xs text-blue-800/90 leading-relaxed">
                  {result.explanation || result.message}
                </p>
                {result.suggestions?.length > 0 && (
                  <div className="pt-2 border-t border-blue-200 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                      Try These Specific Prompts:
                    </div>
                    {result.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setPrompt(sug);
                          handleGenerate(sug);
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-blue-100/50 border border-blue-200 text-xs text-blue-900 transition-colors flex items-center justify-between group cursor-pointer shadow-2xs"
                      >
                        <span>{sug}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!['PHYSICAL_ACTION', 'UNSUPPORTED', 'AMBIGUOUS'].includes(result.intent) && (
              <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 text-xs text-slate-800 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                  <AlertTriangle className="w-5 h-5 text-slate-600" />
                  <span>{result.intent || 'Request Notice'}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {result.explanation || result.message || 'Please provide a clearer automation instruction (e.g. When X happens, do Y).'}
                </p>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default AIBuilderPage;
