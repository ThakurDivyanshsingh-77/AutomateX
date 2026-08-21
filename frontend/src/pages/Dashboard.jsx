import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { workflowService } from '../features/workflow/services/workflowService';
import { executionService } from '../features/workflow/services/executionService';
import { credentialService } from '../features/credentials/services/credentialService';
import { templateService } from '../features/templates/services/templateService';
import {
  Zap,
  Sparkles,
  Play,
  Plus,
  GitFork,
  Activity,
  ShieldCheck,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  ChevronRight,
  ExternalLink,
  Bot,
  Terminal,
  Database,
  Mail,
  MessageSquare,
  FileSpreadsheet,
  Cpu,
  Flame,
  Wand2,
  Copy,
  Sliders,
  Check,
  Settings,
  MoreVertical,
  Radio,
  Share2,
  Gauge
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Stats State
  const [statsLoading, setStatsLoading] = useState(true);
  const [executionStats, setExecutionStats] = useState(null);
  const [totalWorkflows, setTotalWorkflows] = useState(0);
  const [activeWorkflowsCount, setActiveWorkflowsCount] = useState(0);
  const [draftWorkflowsCount, setDraftWorkflowsCount] = useState(0);
  const [credentialsCount, setCredentialsCount] = useState(0);
  const [templatesCount, setTemplatesCount] = useState(0);

  // Workflows List State
  const [workflows, setWorkflows] = useState([]);
  const [workflowsLoading, setWorkflowsLoading] = useState(true);
  const [workflowFilter, setWorkflowFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [runningWorkflowId, setRunningWorkflowId] = useState(null);

  // Recent Executions Feed State
  const [recentExecutions, setRecentExecutions] = useState([]);
  const [executionsLoading, setExecutionsLoading] = useState(true);

  // AI Prompt Bar State
  const [aiPrompt, setAiPrompt] = useState('');

  // Top Starter Templates State
  const [starterTemplates, setStarterTemplates] = useState([]);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // 1. Fetch Overview & Metrics
  const loadDashboardData = useCallback(async () => {
    setStatsLoading(true);
    setWorkflowsLoading(true);
    setExecutionsLoading(true);

    try {
      const [workflowsRes, execStatsRes, execListRes, credsRes, templatesRes] = await Promise.allSettled([
        workflowService.getWorkflows({ limit: 50 }),
        executionService.getExecutionStats(),
        executionService.getExecutions({ limit: 6 }),
        credentialService.getCredentials(),
        templateService.getTemplates('all'),
      ]);

      // Workflows
      if (workflowsRes.status === 'fulfilled') {
        const wfList = workflowsRes.value?.data || workflowsRes.value?.workflows || [];
        setWorkflows(wfList);
        setTotalWorkflows(workflowsRes.value?.total || wfList.length || 0);
        setActiveWorkflowsCount(wfList.filter((w) => w.status === 'active' || w.isActive).length);
        setDraftWorkflowsCount(wfList.filter((w) => w.status === 'draft' || !w.status).length);
      }

      // Execution Stats
      if (execStatsRes.status === 'fulfilled') {
        setExecutionStats(execStatsRes.value?.stats || null);
      }

      // Recent Executions
      if (execListRes.status === 'fulfilled') {
        const execs = execListRes.value?.data || execListRes.value?.executions || [];
        setRecentExecutions(execs);
      }

      // Credentials Vault
      if (credsRes.status === 'fulfilled') {
        const creds = credsRes.value?.data || credsRes.value || [];
        setCredentialsCount(Array.isArray(creds) ? creds.length : 0);
      }

      // Templates
      if (templatesRes.status === 'fulfilled') {
        const tpls = templatesRes.value?.data || templatesRes.value || [];
        setTemplatesCount(tpls.length || 0);
        setStarterTemplates(tpls.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setStatsLoading(false);
      setWorkflowsLoading(false);
      setExecutionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Quick Workflow Run
  const handleQuickRun = async (workflowId, e) => {
    e?.stopPropagation();
    setRunningWorkflowId(workflowId);
    try {
      const res = await executionService.runWorkflow(workflowId);
      toast.success(res.message || 'Workflow executed successfully!');

      const [updatedExecs, updatedStats] = await Promise.allSettled([
        executionService.getExecutions({ limit: 6 }),
        executionService.getExecutionStats(),
      ]);
      if (updatedExecs.status === 'fulfilled') {
        setRecentExecutions(updatedExecs.value?.data || updatedExecs.value?.executions || []);
      }
      if (updatedStats.status === 'fulfilled') {
        setExecutionStats(updatedStats.value?.stats || null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Execution failed');
    } finally {
      setRunningWorkflowId(null);
    }
  };

  // Handle Workflow Duplication
  const handleDuplicateWorkflow = async (workflowId, e) => {
    e?.stopPropagation();
    try {
      await workflowService.duplicateWorkflow(workflowId);
      toast.success('Workflow cloned successfully!');
      loadDashboardData();
    } catch (err) {
      toast.error('Failed to duplicate workflow');
    }
  };

  // Handle Quick Template Clone
  const handleInstantiateTemplate = async (templateId) => {
    try {
      const res = await templateService.instantiateTemplate(templateId);
      const newWf = res.workflow || res.data || res;
      toast.success('Blueprint cloned into your workspace!');
      navigate(`/builder/${newWf._id}`);
    } catch (err) {
      toast.error('Failed to instantiate template');
    }
  };

  // Submit AI Prompt
  const handleAIGenerate = (e) => {
    e?.preventDefault();
    if (!aiPrompt.trim()) {
      toast.error('Please enter what you want to automate');
      return;
    }
    navigate('/ai-builder', {
      state: {
        initialPrompt: aiPrompt.trim(),
        autoGenerate: true,
      },
    });
  };

  // Filtered workflows for display
  const filteredWorkflows = workflows
    .filter((wf) => {
      if (workflowFilter === 'active') return wf.status === 'active' || wf.isActive;
      if (workflowFilter === 'draft') return wf.status === 'draft' || !wf.status;
      return true;
    })
    .filter((wf) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return wf.name?.toLowerCase().includes(q) || wf.description?.toLowerCase().includes(q);
    });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'success' || s === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Success
        </span>
      );
    }
    if (s === 'failed' || s === 'error') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Failed
        </span>
      );
    }
    if (s === 'running' || s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
          <Loader2 className="w-2.5 h-2.5 animate-spin text-orange-600" /> {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
        {status || 'Draft'}
      </span>
    );
  };

  const samplePromptSuggestions = [
    { title: 'Sheets ➔ Discord Alert', prompt: 'Watch Google Sheets row addition and send an embed message to Discord channel' },
    { title: 'Webhook ➔ Gmail Dispatch', prompt: 'Receive customer lead webhook, format JSON data, and send email summary via Gmail' },
    { title: 'Scheduled API Healthcheck', prompt: 'Every hour send HTTP GET to production endpoints and alert Slack if status code is not 200' },
  ];

  return (
    <div className="min-h-full space-y-8 max-w-7xl mx-auto select-none font-sans text-slate-900 pb-16">

      {/* ── 1. Hero Header & Live Workspace Status (White & Orange Theme) ── */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
        {/* Soft Warm Ambient Accent Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-orange-500/5 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-36 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200 shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> AutomateX Enterprise Engine
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> DAG Engine Operational
              </span>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                {getGreeting()}, <span className="text-gradient-brand">{user?.name || 'Architect'}</span> 👋
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Visual DAG graph orchestration, automated event triggers, and real-time execution telemetry in a unified workspace.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('/ai-builder')}
              className="group flex-1 md:flex-initial px-4 py-2.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-xs transition-all shadow-sm hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-orange-600 animate-pulse" />
              <span>AI Workflow Builder</span>
            </button>

            <button
              onClick={() => navigate('/workflows/create')}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-xs transition-all shadow-md shadow-brand-500/20 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workflow</span>
            </button>

            <button
              onClick={loadDashboardData}
              title="Refresh Live Metrics"
              className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin text-brand-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. KPI Analytics Grid (White & Orange Cards) ───── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workflows */}
        <div
          onClick={() => navigate('/workflows')}
          className="group cursor-pointer p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Workflows</span>
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 group-hover:scale-110 transition-transform">
              <GitFork className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-brand-600" /> : totalWorkflows}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
              <span className="text-emerald-600 font-bold">{activeWorkflowsCount} Active</span>
              <span className="text-slate-300">·</span>
              <span className="text-amber-600 font-bold">{draftWorkflowsCount} Drafts</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-transform ml-auto" />
            </div>
          </div>
        </div>

        {/* Execution Volume */}
        <div
          onClick={() => navigate('/executions')}
          className="group cursor-pointer p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Executions Volume</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight flex items-center gap-2">
              {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-brand-600" /> : (executionStats?.totalExecutions || 0)}
              <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {executionStats?.successRate || 100}%
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
              <span className="text-emerald-600 font-bold">{executionStats?.successful || 0} OK</span>
              <span className="text-slate-300">·</span>
              <span className="text-rose-600 font-bold">{executionStats?.failed || 0} ERR</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-transform ml-auto" />
            </div>
          </div>
        </div>

        {/* Average Latency */}
        <div
          onClick={() => navigate('/executions')}
          className="group cursor-pointer p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Engine Latency</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 group-hover:scale-110 transition-transform">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-600 font-mono tracking-tight">
              {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-amber-600" /> : `${executionStats?.averageDuration || 24} ms`}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>Topological DAG speed</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-transform ml-auto" />
            </div>
          </div>
        </div>

        {/* Credentials Vault */}
        <div
          onClick={() => navigate('/credentials')}
          className="group cursor-pointer p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Encrypted Vault</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-brand-600" /> : credentialsCount}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span className="text-emerald-700 font-medium">AES-256-CBC Keys</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-transform ml-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. AI Workflow Generator Interactive Prompt Bar ── */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-orange-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
                <Wand2 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                AI Automation Generator
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-50 text-orange-700 border border-orange-200">
                Neural Graph Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Type what you want to automate in plain English. AutomateX will assemble your triggers, transform functions, logic conditions, and app connectors.
            </p>
          </div>

          {/* Prompt Bar Form */}
          <form onSubmit={handleAIGenerate} className="w-full lg:max-w-xl flex items-center gap-2">
            <div className="relative flex-1">
              <Sparkles className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. When a new row is added in Google Sheets, send Discord alert and log to MongoDB..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-xs transition-all shadow-md shadow-brand-500/20 hover:scale-[1.02] flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Build</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Quick Blueprints:</span>
          {samplePromptSuggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAiPrompt(item.prompt);
                navigate('/ai-builder', { state: { initialPrompt: item.prompt, autoGenerate: true } });
              }}
              className="px-3 py-1 rounded-xl bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-700 border border-slate-200 hover:border-orange-200 text-[11px] transition-all flex items-center gap-1.5 font-medium"
            >
              <Bot className="w-3 h-3 text-orange-500" />
              <span>{item.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Main Two-Column Layout: Workflows Hub & Real-time Live Feed ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Automation Workflows Workspace */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <GitFork className="w-4 h-4 text-brand-600" /> Automation Workflows
              </h2>
              <p className="text-xs text-slate-500">Manage, test execute, and configure your visual DAG pipelines.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {['all', 'active', 'draft'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setWorkflowFilter(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    workflowFilter === tab
                      ? 'bg-brand-500 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar for Workflows */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows by title or description..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all shadow-sm"
            />
          </div>

          {/* Workflows Grid / Cards */}
          {workflowsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-white border border-slate-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 mx-auto flex items-center justify-center">
                <GitFork className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No workflows found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'No workflows match your search query.'
                  : 'Start automating by creating a new workflow or prompt the AI builder!'}
              </p>
              <button
                onClick={() => navigate('/workflows/create')}
                className="px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/20"
              >
                <Plus className="w-3.5 h-3.5" /> Create Workflow
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWorkflows.slice(0, 6).map((wf) => (
                <div
                  key={wf._id}
                  onClick={() => navigate(`/builder/${wf._id}`)}
                  className="group relative cursor-pointer p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 group-hover:scale-105 transition-all">
                        <Zap className="w-4 h-4 fill-orange-500 text-orange-500" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            wf.status === 'active' || wf.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {wf.status === 'active' || wf.isActive ? 'Active' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                        {wf.name || 'Untitled Automation'}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {wf.description || 'Visual automation workflow.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[10px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-bold">
                      {wf.nodes?.length || wf.definition?.nodes?.length || 3} Nodes
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleQuickRun(wf._id, e)}
                        disabled={runningWorkflowId === wf._id}
                        title="Run Workflow"
                        className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm"
                      >
                        {runningWorkflowId === wf._id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-orange-600" />
                        ) : (
                          <Play className="w-3 h-3 fill-orange-600 text-orange-600" />
                        )}
                        <span>Run</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/builder/${wf._id}`);
                        }}
                        title="Edit Canvas"
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Edit Canvas</span>
                      </button>

                      <button
                        onClick={(e) => handleDuplicateWorkflow(wf._id, e)}
                        title="Duplicate Workflow"
                        className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Workflows Link */}
          {workflows.length > 6 && (
            <div className="text-center pt-2">
              <button
                onClick={() => navigate('/workflows')}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 transition-colors"
              >
                <span>View all {totalWorkflows} workflows</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Column: Real-time Execution Feed & Quick Starter Templates */}
        <div className="space-y-6">
          {/* Live Execution Activity Feed */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Executions</h3>
              </div>
              <button
                onClick={() => navigate('/executions')}
                className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
              >
                <span>All Logs</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {executionsLoading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentExecutions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 space-y-1">
                <Terminal className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                <p>No recent execution logs.</p>
                <p className="text-[10px]">Trigger a workflow to view real-time traces.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentExecutions.map((exec) => (
                  <div
                    key={exec._id}
                    onClick={() => navigate('/executions')}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-orange-300 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors truncate">
                        {exec.workflowName || exec.workflow?.name || 'Untitled Automation'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                        <span className="uppercase font-bold text-slate-700">{exec.triggerType || 'manual'}</span>
                        <span>·</span>
                        <span>{exec.duration || 18}ms</span>
                        <span>·</span>
                        <span>{new Date(exec.startedAt || exec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div>
                      {getStatusBadge(exec.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Starter Templates */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Starter Blueprints</h3>
              </div>
              <button
                onClick={() => navigate('/templates')}
                className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
              >
                <span>Store</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {starterTemplates.length > 0 ? (
                starterTemplates.map((tpl) => (
                  <div
                    key={tpl._id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-orange-300 transition-all flex items-center justify-between gap-2 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors truncate">{tpl.name}</div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{tpl.description}</p>
                    </div>
                    <button
                      onClick={() => handleInstantiateTemplate(tpl._id)}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition-colors"
                    >
                      <Copy className="w-3 h-3" /> Use
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                  <span>Explore 20+ ready-to-run blueprints</span>
                  <button
                    onClick={() => navigate('/templates')}
                    className="px-2.5 py-1 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-bold"
                  >
                    Browse
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Connected Integrations Ecosystem Rail ──── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" /> Connected Apps & Integration Connectors
            </h3>
            <p className="text-xs text-slate-500">
              Plug in and authorize your software stack with instant OAuth 2.0 and encrypted vaults.
            </p>
          </div>

          <button
            onClick={() => navigate('/credentials')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5 w-fit"
          >
            <span>Manage Vault</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-600" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
          {[
            { name: 'Google Sheets', icon: FileSpreadsheet, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
            { name: 'Gmail OAuth', icon: Mail, color: 'text-rose-700 bg-rose-50 border-rose-200' },
            { name: 'Discord Bot', icon: MessageSquare, color: 'text-brand-700 bg-orange-50 border-orange-200' },
            { name: 'Slack API', icon: MessageSquare, color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { name: 'Webhooks Gateway', icon: Zap, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
            { name: 'MongoDB / SQL', icon: Database, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
          ].map((app, i) => {
            const Icon = app.icon;
            return (
              <div
                key={i}
                onClick={() => navigate('/credentials')}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-300 transition-all cursor-pointer flex items-center gap-2.5 group"
              >
                <div className={`p-2 rounded-xl border ${app.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-brand-600 transition-colors truncate">
                  {app.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>

  );
};

export default Dashboard;

