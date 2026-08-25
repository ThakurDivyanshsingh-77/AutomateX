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
  Github,
  Mail,
  MessageSquare,
  Clock,
  Database,
  FileSpreadsheet,
  Cpu,
  CornerDownLeft,
  X,
} from 'lucide-react';
import { aiService } from '../services/aiService';
import toast from 'react-hot-toast';

const PROMPT_CATEGORIES = [
  {
    category: 'Featured & Daily Automation',
    items: [
      {
        title: 'Daily Activity Heartbeat (GitHub)',
        icon: Github,
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        prompt: 'Every day at 9 AM commit my daily activity record to my GitHub repository.',
        badge: 'GitHub',
      },
      {
        title: 'GitHub Profile README Sync',
        icon: Github,
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        prompt: 'When a new repository is created, synchronize my profile README with my projects.',
        badge: 'README',
      },
      {
        title: 'Discord Live Stream Embed Alert',
        icon: MessageSquare,
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        prompt: 'Every 10 minutes send my live stream link to Discord with rich embed.',
        badge: 'Discord',
      },
    ],
  },
  {
    category: 'Data & Notifications',
    items: [
      {
        title: 'Daily Weather & Gmail Report',
        icon: Mail,
        color: 'text-rose-600 bg-rose-50 border-rose-200',
        prompt: 'Every morning at 9 AM send me a Gmail notification report.',
        badge: 'Gmail',
      },
      {
        title: 'Google Sheets & MongoDB Sync',
        icon: FileSpreadsheet,
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        prompt: 'When a new row is added to Google Sheets, insert document into MongoDB database.',
        badge: 'Database',
      },
    ],
  },
  {
    category: 'Safety & Rejection Guardrails',
    items: [
      {
        title: 'Physical Action Test (Coffee)',
        icon: Flame,
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        prompt: 'Make me a coffee every morning.',
        badge: 'Physical Guard',
      },
      {
        title: 'Unsupported Test (Notion)',
        icon: AlertCircle,
        color: 'text-red-600 bg-red-50 border-red-200',
        prompt: 'When a GitHub issue is opened, update my Notion page.',
        badge: 'Unsupported',
      },
    ],
  },
];

const PIPELINE_STAGES = [
  'Intent Classification',
  'Capability Matching',
  'Workflow Planning',
  'Topology & Credential Validation',
  'Ready',
];

export const AIBuilderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [prompt, setPrompt] = useState(location.state?.initialPrompt || '');
  const [generating, setGenerating] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
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
    setStageIndex(0);

    const t1 = setTimeout(() => setStageIndex(1), 250);
    const t2 = setTimeout(() => setStageIndex(2), 550);
    const t3 = setTimeout(() => setStageIndex(3), 900);

    try {
      const res = await aiService.generateWorkflow(textToUse.trim());
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setStageIndex(4);
      setResult(res);

      if (res.isAutomation && res.success) {
        toast.success(`✨ Workflow "${res.name || 'AI Generated'}" ready!`);
      } else if (res.intent === 'PHYSICAL_ACTION') {
        toast.error('Physical task detected. Digital alternatives suggested.');
      } else if (res.intent === 'UNSUPPORTED') {
        toast.error('Unsupported service detected.');
      } else if (res.intent === 'AMBIGUOUS') {
        toast('Clarification needed for missing parameters.', { icon: 'ℹ️' });
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
    <div className="space-y-6 max-w-5xl mx-auto select-none font-sans text-slate-900 pb-16 pt-2">
      {/* Premium Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 md:p-8 text-white shadow-xl overflow-hidden border border-slate-800">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                AI WORKFLOW BUILDER 2.0
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Zero Hallucinations
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Turn natural language into <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-purple-400 bg-clip-text text-transparent">executable workflows</span>
            </h1>

            <p className="text-xs md:text-sm text-slate-300/90 leading-relaxed font-normal">
              Describe your desired automation in plain English. AutomateX classifies intent, discovers real platform capabilities, enforces DAG connectivity, and constructs production-ready workflows.
            </p>
          </div>

          <div className="flex flex-row md:flex-col gap-2 shrink-0 text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm flex items-center gap-2 text-slate-200">
              <Cpu className="w-4 h-4 text-orange-400" />
              <span>40+ Real Nodes</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm flex items-center gap-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Strict Validation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Prompt Input Area */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-orange-600" />
            <span>Describe Your Workflow Intent</span>
          </label>
          {prompt && (
            <button
              onClick={() => setPrompt('')}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            rows={3}
            placeholder="e.g. When a new GitHub repository is created, synchronize my profile README with my top projects."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all resize-none leading-relaxed font-sans shadow-inner"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-600 font-medium">
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 border border-slate-300 font-mono text-[10px] text-slate-700">Ctrl + Enter</kbd> to generate
            </span>

            <button
              onClick={() => handleGenerate()}
              disabled={generating || !prompt.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-orange-500/25 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Planning Workflow...</span>
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

        {/* Live Generation Pipeline Visualizer */}
        {generating && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">AI Pipeline Execution</span>
              <span className="text-orange-400 animate-pulse">{PIPELINE_STAGES[stageIndex]}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {PIPELINE_STAGES.map((st, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    i <= stageIndex
                      ? 'bg-gradient-to-r from-orange-500 to-amber-400 shadow-sm shadow-orange-500/50'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Generated Result Container */}
      {result && (
        result.isAutomation && result.success ? (
          /* VALID WORKFLOW CARD */
          <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-md space-y-5 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ✓ VALIDATED WORKFLOW
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Confidence: {Math.round((result.qualityScore || 1) * 100)}%
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">{result.name}</h3>
                <p className="text-xs text-slate-500">{result.description}</p>
              </div>

              {result.workflow?._id && (
                <button
                  onClick={handleOpenInBuilder}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/25 shrink-0 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Open in Canvas Builder</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Validation Checklist Chips */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pre-Execution Validation Checklist
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                {Object.entries(result.checks || {}).map(([key, val]) => (
                  <div
                    key={key}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium ${
                      val
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {val ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="capitalize text-[11px] font-semibold truncate">{key}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Planned Execution DAG Sequence */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Planned Node Execution DAG ({result.definition?.nodes?.length || 0} Nodes)
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white custom-scrollbar">
                {(result.definition?.nodes || []).map((node, i) => (
                  <React.Fragment key={node.id}>
                    <div className="px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs font-semibold flex items-center gap-3 flex-shrink-0 shadow-sm">
                      <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-mono text-[11px] flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-slate-100 font-bold">{node.data?.label || node.type}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{node.type}</div>
                      </div>
                    </div>
                    {i < result.definition.nodes.length - 1 && (
                      <span className="text-orange-400 font-bold flex-shrink-0">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Summary */}
            {result.summary && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-700">
                <Bot className="w-4 h-4 text-orange-600 shrink-0" />
                <span>{result.summary}</span>
              </div>
            )}
          </div>
        ) : (
          /* REJECTION / GUARDRAIL FEEDBACK */
          <div className="animate-fadeIn">
            {result.intent === 'PHYSICAL_ACTION' && (
              <div className="bg-amber-50/90 border-2 border-amber-200 rounded-3xl p-6 text-xs text-amber-900 space-y-4 shadow-sm">
                <div className="flex items-center gap-2.5 font-bold text-sm text-amber-900">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">Physical Action Limitation</h3>
                    <p className="text-[11px] font-normal text-amber-700">AutomateX is a digital platform and cannot execute physical world tasks.</p>
                  </div>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed bg-white/60 p-3 rounded-xl border border-amber-200/60">
                  {result.explanation || result.message}
                </p>
                {result.suggestions?.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                      Suggested Digital Alternatives (Click to Try):
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {result.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setPrompt(sug);
                            handleGenerate(sug);
                          }}
                          className="text-left p-3 rounded-xl bg-white hover:bg-amber-100/80 border border-amber-200 text-xs font-medium text-amber-900 transition-all flex items-center justify-between group cursor-pointer shadow-xs hover:shadow-sm"
                        >
                          <span className="line-clamp-2">{sug}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {result.intent === 'UNSUPPORTED' && (
              <div className="bg-rose-50/90 border-2 border-rose-200 rounded-3xl p-6 text-xs text-rose-900 space-y-4 shadow-sm">
                <div className="flex items-center gap-2.5 font-bold text-sm text-rose-900">
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-rose-900">Unsupported Integration</h3>
                    <p className="text-[11px] font-normal text-rose-700">This platform or service is not natively supported yet.</p>
                  </div>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed bg-white/60 p-3 rounded-xl border border-rose-200/60">
                  {result.explanation || result.message}
                </p>
                {result.suggestions?.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-900">
                      Available Alternatives & Workarounds:
                    </div>
                    <div className="space-y-1.5">
                      {result.suggestions.map((sug, i) => (
                        <div key={i} className="text-xs text-rose-800 flex items-center gap-2 bg-white/40 p-2 rounded-lg">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{sug}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {result.intent === 'AMBIGUOUS' && (
              <div className="bg-blue-50/90 border-2 border-blue-200 rounded-3xl p-6 text-xs text-blue-900 space-y-4 shadow-sm">
                <div className="flex items-center gap-2.5 font-bold text-sm text-blue-900">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-blue-900">Clarification Needed</h3>
                    <p className="text-[11px] font-normal text-blue-700">Please provide missing destination or content details.</p>
                  </div>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed bg-white/60 p-3 rounded-xl border border-blue-200/60">
                  {result.explanation || result.message}
                </p>
                {result.suggestions?.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                      Try These Specific Prompts (Click to Use):
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {result.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setPrompt(sug);
                            handleGenerate(sug);
                          }}
                          className="text-left p-3 rounded-xl bg-white hover:bg-blue-100/80 border border-blue-200 text-xs font-medium text-blue-900 transition-all flex items-center justify-between group cursor-pointer shadow-xs hover:shadow-sm"
                        >
                          <span className="line-clamp-2">{sug}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
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
                  {result.explanation || result.message || 'Please describe an automation workflow with a trigger and action.'}
                </p>
              </div>
            )}
          </div>
        )
      )}

      {/* Categorized Template & Inspiration Cards */}
      <div className="space-y-5 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Explore Ready-To-Build Automation Templates
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Click any template to try</span>
        </div>

        <div className="space-y-4">
          {PROMPT_CATEGORIES.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {cat.category}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setPrompt(item.prompt);
                        handleGenerate(item.prompt);
                      }}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-orange-400 hover:shadow-md text-left transition-all duration-200 group cursor-pointer shadow-xs flex flex-col justify-between h-full"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-xl border ${item.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {item.badge}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                            {item.title}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {item.prompt}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-orange-600 transition-colors">
                        <span>Use Prompt</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIBuilderPage;
