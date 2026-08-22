import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, Cpu, MessageSquare, ArrowRight, CheckCircle2, Play } from 'lucide-react';

export function AIAutomationPage() {
  const [promptInput, setPromptInput] = useState('Extract invoice items from uploaded PDF, calculate total tax, and ping Slack #finance if > $5,000');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState(null);

  const handleSimulateAI = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedNodes([
        { title: 'Trigger: S3 File Upload Listener', type: 'AWS S3 Trigger' },
        { title: 'AI Node: Claude 3.5 Vision (Extract Line Items JSON)', type: 'LLM Vision Node' },
        { title: 'Transform: Sum Taxes & Validate Schema', type: 'JavaScript Code Node' },
        { title: 'Condition: Tax Total > $5,000?', type: 'Filter / Branch' },
        { title: 'Action: Post High-Value Alert with Actions to Slack', type: 'Slack Blocks Dispatch' },
      ]);
    }, 900);
  };

  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Sparkles className="w-3.5 h-3.5" /> AI-Native Workflow Orchestration
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-6" style={{ color: '#1A1012' }}>
          Turn natural language prompts into <span style={{ color: '#ff4f00' }}>production pipelines</span>
        </h1>
        <p className="text-lg text-ink-body max-w-2xl mx-auto" style={{ color: '#5C5050' }}>
          Build intelligent, self-correcting agents with multi-LLM routing, prompt chaining, vector embeddings, and deterministic guardrails.
        </p>
      </div>

      {/* Interactive AI Prompt-to-Workflow Generator Simulator */}
      <div className="rounded-3xl border border-cream-border bg-ink text-white p-6 sm:p-10 mb-20 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 mb-3">
          <Brain className="w-4 h-4" /> Try the Autonomous AI Workflow Synthesizer
        </div>
        <form onSubmit={handleSimulateAI} className="space-y-4 mb-6">
          <div className="relative">
            <textarea
              rows={3}
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              placeholder="Describe what you want to automate in plain English..."
              className="w-full p-4 rounded-2xl bg-black/40 border border-white/15 text-sm sm:text-base text-white outline-none focus:border-orange-500 font-sans resize-none"
            />
            <button
              type="submit"
              disabled={isGenerating}
              className="absolute right-3 bottom-4 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-orange-500 text-white hover:bg-orange-600 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isGenerating ? (
                <>Synthesizing Graph...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Pipeline
                </>
              )}
            </button>
          </div>
        </form>

        {/* AI Output preview */}
        {generatedNodes && (
          <div className="border-t border-white/10 pt-6 animate-fade-in">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Synthesized Workflow Graph (5 Connected Nodes):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {generatedNodes.map((node, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                  <div className="text-xs text-orange-400 font-semibold mb-1">{node.type}</div>
                  <div className="text-xs font-medium text-gray-200">{node.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3 AI Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="p-8 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-3">Multi-LLM Dynamic Router</h3>
          <p className="text-sm text-ink-body leading-relaxed mb-4">
            Route prompts dynamically across OpenAI GPT-4o, Anthropic Claude 3.5, and Google Gemini based on latency, cost, or reasoning complexity.
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-3">Autonomous Agent Loops</h3>
          <p className="text-sm text-ink-body leading-relaxed mb-4">
            Build agents that query databases, browse endpoints, self-correct parsing errors, and trigger downstream events autonomously.
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-3">Deterministic Schema Repair</h3>
          <p className="text-sm text-ink-body leading-relaxed mb-4">
            Enforce strict JSON schema types on LLM outputs. When validation fails, AutomateX instantly initiates an auto-repair prompt loop.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-3xl p-8 sm:p-12 text-center bg-ink text-white">
        <h2 className="text-3xl font-bold mb-4">Build your first AI workflow in 60 seconds</h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-8 text-sm">
          No complex Python frameworks required. Prompt, connect, and deploy autonomous workflows instantly.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md transition-all"
        >
          Launch AI Builder <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default AIAutomationPage;
