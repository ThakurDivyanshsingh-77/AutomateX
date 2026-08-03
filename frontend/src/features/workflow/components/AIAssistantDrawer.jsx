import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  HelpCircle,
  Zap,
  Wrench,
  CheckCircle2,
  Loader2,
  Bot,
  AlertCircle
} from 'lucide-react';
import { aiService } from '../../ai/services/aiService';
import toast from 'react-hot-toast';

export const AIAssistantDrawer = ({ workflowId, nodes, edges, onApplyDefinition, onClose }) => {
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'explain' | 'optimize' | 'fix'
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');

  // 1. Generate Prompt on Canvas
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Enter a prompt first');
      return;
    }
    setLoading(true);
    try {
      const res = await aiService.generateWorkflow(prompt.trim());
      if (res.definition) {
        onApplyDefinition(res.definition.nodes, res.definition.edges);
        toast.success('✨ Canvas updated with generated workflow!');
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
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
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">AutomateX AI Assistant</h3>
              <p className="text-[10px] text-slate-500">Generate, explain, optimize & auto-repair workflow</p>
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
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
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
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Describe Desired Workflow
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  placeholder="e.g. When a webhook is received, send a Gmail message, wait 5 minutes, then send a Slack notification."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono resize-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-white" />}
                Generate & Replace Canvas
              </button>
            </div>
          )}

          {/* TAB 2: Explain */}
          {activeTab === 'explain' && (
            <div className="space-y-3">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  Generating natural language explanation...
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" /> Workflow Graph Explanation
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
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
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
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
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
