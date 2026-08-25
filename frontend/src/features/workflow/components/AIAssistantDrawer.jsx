import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  HelpCircle,
  Zap,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Bot,
  ArrowRight,
  ShieldCheck,
  Layers,
  Key,
  Flame,
  HelpCircle as QuestionIcon,
} from 'lucide-react';
import { aiService } from '../../ai/services/aiService';
import toast from 'react-hot-toast';

const PIPELINE_STAGES = [
  { id: 'intent', label: 'Intent Analysis' },
  { id: 'capabilities', label: 'Checking Capabilities' },
  { id: 'planning', label: 'Workflow Planning' },
  { id: 'validation', label: 'Validating Nodes & Credentials' },
  { id: 'ready', label: 'Ready' },
];

export const AIAssistantDrawer = ({ workflowId, nodes, edges, onApplyDefinition, onClose }) => {
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'explain' | 'optimize' | 'fix'
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [result, setResult] = useState(null);
  const [resultText, setResultText] = useState('');

  // 1. Generate Prompt on Canvas with Pipeline
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Enter an automation prompt first');
      return;
    }
    setLoading(true);
    setResult(null);
    setCurrentStage(0);

    // Live stage progression
    const stageTimer1 = setTimeout(() => setCurrentStage(1), 350);
    const stageTimer2 = setTimeout(() => setCurrentStage(2), 700);
    const stageTimer3 = setTimeout(() => setCurrentStage(3), 1100);

    try {
      const res = await aiService.generateWorkflow(prompt.trim());
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setCurrentStage(4);
      setResult(res);

      if (res.success && res.isAutomation) {
        toast.success(`✨ Workflow planned (${res.definition?.nodes?.length || 0} nodes)!`);
      } else if (res.intent === 'PHYSICAL_ACTION') {
        toast.error('Physical action detected. See digital alternatives.');
      } else if (res.intent === 'UNSUPPORTED') {
        toast.error('Unsupported integration. See available options.');
      } else if (res.intent === 'AMBIGUOUS') {
        toast('Clarification needed for missing parameters.', { icon: 'ℹ️' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToCanvas = () => {
    if (!result?.definition) {
      toast.error('No workflow definition to apply');
      return;
    }
    onApplyDefinition(result.definition.nodes, result.definition.edges);
    toast.success('✨ Canvas updated with generated workflow!');
    onClose();
  };

  // 2. Explain Canvas Workflow
  const handleExplain = async () => {
    setLoading(true);
    setResultText('');
    try {
      const currentDefinition = { nodes, edges };
      const res = await aiService.explainWorkflow(currentDefinition);
      setResultText(res.explanation || 'No explanation available.');
    } catch (err) {
      toast.error('Explanation failed');
    } finally {
      setLoading(false);
    }
  };

  // 3. Optimize Canvas Workflow
  const handleOptimize = async () => {
    setLoading(true);
    setResultText('');
    try {
      const currentDefinition = { nodes, edges };
      const res = await aiService.optimizeWorkflow(currentDefinition);
      if (res.definition) {
        onApplyDefinition(res.definition.nodes, res.definition.edges);
        setResultText(`✓ Optimization Complete:\n${(res.changes || []).map((c) => `• ${c}`).join('\n')}`);
        toast.success('Workflow canvas optimized!');
      }
    } catch (err) {
      toast.error('Optimization failed');
    } finally {
      setLoading(false);
    }
  };

  // 4. Auto-Fix Canvas Errors
  const handleFix = async () => {
    setLoading(true);
    setResultText('');
    try {
      const currentDefinition = { nodes, edges };
      const res = await aiService.fixWorkflow(currentDefinition);
      if (res.definition) {
        onApplyDefinition(res.definition.nodes, res.definition.edges);
        setResultText(`🔧 Auto-Fix Applied:\n${(res.fixesApplied || []).map((f) => `• ${f}`).join('\n')}`);
        toast.success('Canvas graph auto-repaired!');
      }
    } catch (err) {
      toast.error('Auto-fix failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm select-none font-sans text-slate-100">
      <div className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/20 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">AI Workflow Builder 2.0</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Intent discovery, capability planning & zero hallucinations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 p-2 gap-1 bg-slate-950 border-b border-slate-800 text-[11px] font-semibold">
          {[
            { id: 'generate', label: 'Generate', icon: Wand2 },
            { id: 'explain', label: 'Explain', icon: HelpCircle },
            { id: 'optimize', label: 'Optimize', icon: Zap },
            { id: 'fix', label: 'Auto-Fix', icon: Wrench },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setResultText('');
                  if (tab.id === 'explain') handleExplain();
                  if (tab.id === 'optimize') handleOptimize();
                  if (tab.id === 'fix') handleFix();
                }}
                className={`py-2 px-1 rounded-lg transition-all flex flex-col items-center gap-1 ${
                  isActive
                    ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* TAB 1: Generate */}
          {activeTab === 'generate' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Describe Automation Request</span>
                  <span className="text-[10px] text-purple-400 lowercase font-normal">natural language</span>
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  placeholder="e.g. Every day at 9 AM send my daily GitHub activity commit, or When a new repository is created sync my README."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 font-sans resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-white" />}
                Analyze & Plan Workflow
              </button>

              {/* LIVE PIPELINE PROGRESS */}
              {loading && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>AI Execution Pipeline</span>
                    <span className="text-purple-400 animate-pulse">{PIPELINE_STAGES[currentStage]?.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {PIPELINE_STAGES.map((st, idx) => (
                      <div
                        key={st.id}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          idx <= currentStage ? 'bg-purple-500 shadow-sm shadow-purple-500/50' : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* RESULT: PHYSICAL ACTION REJECTION */}
              {result && result.intent === 'PHYSICAL_ACTION' && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Physical Action Limitation</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    {result.explanation}
                  </p>
                  {result.suggestions?.length > 0 && (
                    <div className="pt-2 border-t border-amber-500/20 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Suggested Digital Alternatives:
                      </div>
                      {result.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setPrompt(sug);
                            handleGenerate();
                          }}
                          className="w-full text-left p-2 rounded-lg bg-amber-900/30 hover:bg-amber-900/50 border border-amber-700/30 text-xs text-amber-200 transition-colors flex items-center justify-between group"
                        >
                          <span className="truncate">{sug}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* RESULT: UNSUPPORTED INTEGRATION */}
              {result && result.intent === 'UNSUPPORTED' && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Unsupported Integration</span>
                  </div>
                  <p className="text-xs text-rose-200/90 leading-relaxed">
                    {result.explanation}
                  </p>
                  {result.suggestions?.length > 0 && (
                    <div className="pt-2 border-t border-rose-500/20 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                        Available Alternatives:
                      </div>
                      {result.suggestions.map((sug, i) => (
                        <div key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="text-rose-400">•</span>
                          <span>{sug}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* RESULT: AMBIGUOUS QUERY */}
              {result && result.intent === 'AMBIGUOUS' && (
                <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                    <QuestionIcon className="w-4 h-4 text-blue-400" />
                    <span>Clarification Needed</span>
                  </div>
                  <p className="text-xs text-blue-200/90 leading-relaxed">
                    {result.explanation}
                  </p>
                  {result.suggestions?.length > 0 && (
                    <div className="pt-2 border-t border-blue-500/20 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                        Try These Specific Prompts:
                      </div>
                      {result.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setPrompt(sug);
                            handleGenerate();
                          }}
                          className="w-full text-left p-2 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700/30 text-xs text-blue-200 transition-colors flex items-center justify-between group"
                        >
                          <span className="truncate">{sug}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* RESULT: VALID AUTOMATION WORKFLOW */}
              {result && result.success && result.isAutomation && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5">
                  {/* Workflow Overview */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          VALIDATED DAG
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Score: {Math.round((result.qualityScore || 1) * 100)}%
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 mt-1">
                        {result.name}
                      </h4>
                    </div>
                  </div>

                  {/* Multi-Check Verification Badge Strip */}
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    {Object.entries(result.checks || {}).map(([key, val]) => (
                      <div
                        key={key}
                        className={`p-1.5 rounded-lg border flex items-center gap-1.5 ${
                          val
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        {val ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-rose-400" />}
                        <span className="capitalize font-medium">{key}</span>
                      </div>
                    ))}
                  </div>

                  {/* DAG Node Step Chain */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Planned Pipeline Steps:
                    </div>
                    {result.plan?.steps?.map((st, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-200"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-center">
                            {st.step}
                          </span>
                          <span className="font-semibold">{st.name}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          {st.nodeType}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Warnings / Partial notices */}
                  {result.warnings?.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 space-y-1 text-xs text-amber-300">
                      {result.warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Apply to Canvas Action */}
                  <button
                    onClick={handleApplyToCanvas}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Apply Workflow to Canvas
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Explain */}
          {activeTab === 'explain' && (
            <div className="space-y-3">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                  Generating natural language explanation...
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-purple-400" /> Workflow Graph Explanation
                  </h4>
                  <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                    {resultText}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Optimize */}
          {activeTab === 'optimize' && (
            <div className="space-y-3">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                  Optimizing workflow graph...
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Optimization Report
                  </h4>
                  <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                    {resultText}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Fix */}
          {activeTab === 'fix' && (
            <div className="space-y-3">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                  Scanning and auto-fixing canvas graph errors...
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Auto-Repair Report
                  </h4>
                  <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                    {resultText}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantDrawer;
