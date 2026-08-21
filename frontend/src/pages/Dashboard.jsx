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
  Gauge,
} from 'lucide-react';

import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ============================================================
  // Stats State
  // ============================================================

  const [statsLoading, setStatsLoading] = useState(true);
  const [executionStats, setExecutionStats] = useState(null);
  const [totalWorkflows, setTotalWorkflows] = useState(0);
  const [activeWorkflowsCount, setActiveWorkflowsCount] = useState(0);
  const [draftWorkflowsCount, setDraftWorkflowsCount] = useState(0);
  const [credentialsCount, setCredentialsCount] = useState(0);
  const [templatesCount, setTemplatesCount] = useState(0);

  // ============================================================
  // Workflows
  // ============================================================

  const [workflows, setWorkflows] = useState([]);
  const [workflowsLoading, setWorkflowsLoading] = useState(true);
  const [workflowFilter, setWorkflowFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [runningWorkflowId, setRunningWorkflowId] = useState(null);

  // ============================================================
  // Recent Executions
  // ============================================================

  const [recentExecutions, setRecentExecutions] = useState([]);
  const [executionsLoading, setExecutionsLoading] = useState(true);

  // ============================================================
  // AI Prompt
  // ============================================================

  const [aiPrompt, setAiPrompt] = useState('');

  // ============================================================
  // Starter Templates
  // ============================================================

  const [starterTemplates, setStarterTemplates] = useState([]);

  // ============================================================
  // Greeting
  // ============================================================

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';

    return 'Good evening';
  };

  // ============================================================
  // Load Dashboard Data
  // ============================================================

  const loadDashboardData = useCallback(async () => {
    setStatsLoading(true);
    setWorkflowsLoading(true);
    setExecutionsLoading(true);

    try {
      const [
        workflowsRes,
        execStatsRes,
        execListRes,
        credsRes,
        templatesRes,
      ] = await Promise.allSettled([
        workflowService.getWorkflows({ limit: 50 }),
        executionService.getExecutionStats(),
        executionService.getExecutions({ limit: 6 }),
        credentialService.getCredentials(),
        templateService.getTemplates('all'),
      ]);

      // ----------------------------------------------------------
      // Workflows
      // ----------------------------------------------------------

      if (workflowsRes.status === 'fulfilled') {
        const wfList =
          workflowsRes.value?.data ||
          workflowsRes.value?.workflows ||
          [];

        setWorkflows(wfList);

        setTotalWorkflows(
          workflowsRes.value?.total ||
          wfList.length ||
          0
        );

        setActiveWorkflowsCount(
          wfList.filter(
            (w) =>
              w.status === 'active' ||
              w.isActive
          ).length
        );

        setDraftWorkflowsCount(
          wfList.filter(
            (w) =>
              w.status === 'draft' ||
              !w.status
          ).length
        );
      }

      // ----------------------------------------------------------
      // Execution Stats
      // ----------------------------------------------------------

      if (execStatsRes.status === 'fulfilled') {
        setExecutionStats(
          execStatsRes.value?.stats || null
        );
      }

      // ----------------------------------------------------------
      // Recent Executions
      // ----------------------------------------------------------

      if (execListRes.status === 'fulfilled') {
        const execs =
          execListRes.value?.data ||
          execListRes.value?.executions ||
          [];

        setRecentExecutions(execs);
      }

      // ----------------------------------------------------------
      // Credentials
      // ----------------------------------------------------------

      if (credsRes.status === 'fulfilled') {
        const creds =
          credsRes.value?.data ||
          credsRes.value ||
          [];

        setCredentialsCount(
          Array.isArray(creds)
            ? creds.length
            : 0
        );
      }

      // ----------------------------------------------------------
      // Templates
      // ----------------------------------------------------------

      if (templatesRes.status === 'fulfilled') {
        const tpls =
          templatesRes.value?.data ||
          templatesRes.value ||
          [];

        setTemplatesCount(tpls.length || 0);
        setStarterTemplates(
          tpls.slice(0, 3)
        );
      }
    } catch (err) {
      console.error(
        'Failed to load dashboard data:',
        err
      );
    } finally {
      setStatsLoading(false);
      setWorkflowsLoading(false);
      setExecutionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ============================================================
  // Quick Workflow Run
  // ============================================================

  const handleQuickRun = async (
    workflowId,
    e
  ) => {
    e?.stopPropagation();

    setRunningWorkflowId(workflowId);

    try {
      const res =
        await executionService.runWorkflow(
          workflowId
        );

      toast.success(
        res.message ||
        'Workflow executed successfully!'
      );

      const [
        updatedExecs,
        updatedStats,
      ] = await Promise.allSettled([
        executionService.getExecutions({
          limit: 6,
        }),
        executionService.getExecutionStats(),
      ]);

      if (
        updatedExecs.status ===
        'fulfilled'
      ) {
        setRecentExecutions(
          updatedExecs.value?.data ||
          updatedExecs.value
            ?.executions ||
          []
        );
      }

      if (
        updatedStats.status ===
        'fulfilled'
      ) {
        setExecutionStats(
          updatedStats.value?.stats ||
          null
        );
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Execution failed'
      );
    } finally {
      setRunningWorkflowId(null);
    }
  };

  // ============================================================
  // Duplicate Workflow
  // ============================================================

  const handleDuplicateWorkflow = async (
    workflowId,
    e
  ) => {
    e?.stopPropagation();

    try {
      await workflowService.duplicateWorkflow(
        workflowId
      );

      toast.success(
        'Workflow cloned successfully!'
      );

      loadDashboardData();
    } catch (err) {
      toast.error(
        'Failed to duplicate workflow'
      );
    }
  };

  // ============================================================
  // Template Clone
  // ============================================================

  const handleInstantiateTemplate =
    async (templateId) => {
      try {
        const res =
          await templateService.instantiateTemplate(
            templateId
          );

        const newWf =
          res.workflow ||
          res.data ||
          res;

        toast.success(
          'Blueprint cloned into your workspace!'
        );

        navigate(
          `/builder/${newWf._id}`
        );
      } catch (err) {
        toast.error(
          'Failed to instantiate template'
        );
      }
    };

  // ============================================================
  // AI Prompt
  // ============================================================

  const handleAIGenerate = (e) => {
    e?.preventDefault();

    if (!aiPrompt.trim()) {
      toast.error(
        'Please enter what you want to automate'
      );

      return;
    }

    navigate('/ai-builder', {
      state: {
        initialPrompt:
          aiPrompt.trim(),
        autoGenerate: true,
      },
    });
  };

  // ============================================================
  // Filtered Workflows
  // ============================================================

  const filteredWorkflows =
    workflows
      .filter((wf) => {
        if (
          workflowFilter === 'active'
        ) {
          return (
            wf.status === 'active' ||
            wf.isActive
          );
        }

        if (
          workflowFilter === 'draft'
        ) {
          return (
            wf.status === 'draft' ||
            !wf.status
          );
        }

        return true;
      })
      .filter((wf) => {
        if (!searchQuery.trim()) {
          return true;
        }

        const q =
          searchQuery.toLowerCase();

        return (
          wf.name
            ?.toLowerCase()
            .includes(q) ||
          wf.description
            ?.toLowerCase()
            .includes(q)
        );
      });

  // ============================================================
  // Status Badge
  // ============================================================

  const getStatusBadge = (status) => {
    const s =
      (status || '').toLowerCase();

    if (
      s === 'success' ||
      s === 'completed'
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Success
        </span>
      );
    }

    if (
      s === 'failed' ||
      s === 'error'
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          Failed
        </span>
      );
    }

    if (
      s === 'running' ||
      s === 'pending'
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
          <Loader2 className="w-3 h-3 animate-spin" />
          {status}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
        {status || 'Draft'}
      </span>
    );
  };

  // ============================================================
  // Prompt Suggestions
  // ============================================================

  const samplePromptSuggestions = [
    {
      title: 'Sheets → Discord',
      prompt:
        'Watch Google Sheets row addition and send an embed message to Discord channel',
    },
    {
      title: 'Webhook → Gmail',
      prompt:
        'Receive customer lead webhook, format JSON data, and send email summary via Gmail',
    },
    {
      title: 'API Healthcheck',
      prompt:
        'Every hour send HTTP GET to production endpoints and alert Slack if status code is not 200',
    },
  ];

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="relative min-h-full bg-[#09090b] text-zinc-100 font-sans select-none pb-14">

      {/* Page background */}
      <div className="fixed inset-0 -z-10 bg-[#09090b]" />

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* ======================================================
            HERO
        ====================================================== */}

        <section className="relative overflow-hidden rounded-2xl bg-[#111214] border border-zinc-800 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 right-10 w-80 h-80 rounded-full bg-orange-500/[0.06] blur-[100px]" />
            <div className="absolute bottom-0 left-1/3 w-60 h-40 rounded-full bg-orange-500/[0.035] blur-[80px]" />
          </div>

          <div className="relative z-10 p-6 md:p-8">

            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-7">

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-2 mb-4">

                  <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-semibold uppercase tracking-wide">
                    <Flame className="w-3 h-3" />
                    AutomateX Workspace
                  </span>

                  <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Automation engine online
                  </span>

                </div>

                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                  {getGreeting()},{' '}
                  <span className="text-orange-500">
                    {user?.name ||
                      'Architect'}
                  </span>
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-zinc-500 leading-relaxed">
                  Build, monitor, and run your
                  automations from one workspace.
                </p>

              </div>

              <div className="flex flex-wrap items-center gap-2">

                <button
                  onClick={() =>
                    navigate(
                      '/ai-builder'
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-[0_8px_25px_rgba(249,115,22,0.18)]"
                >
                  <Sparkles className="w-4 h-4" />
                  Workflow Builder
                </button>

                <button
                  onClick={() =>
                    navigate(
                      '/workflows/create'
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-700 transition-all duration-200"
                >
                  <Plus className="w-4 h-4 text-orange-500" />
                  Create workflow
                </button>

                <button
                  onClick={
                    loadDashboardData
                  }
                  title="Refresh dashboard"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-orange-500 border border-zinc-800 transition-all"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${statsLoading
                        ? 'animate-spin text-orange-500'
                        : ''
                      }`}
                  />
                </button>

              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            KPI GRID
        ====================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">

          {/* Total Workflows */}
          <div
            onClick={() =>
              navigate('/workflows')
            }
            className="group cursor-pointer p-5 rounded-xl bg-[#111214] border border-zinc-800 hover:border-orange-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 font-medium">
                  Total workflows
                </p>

                <div className="mt-4 text-3xl font-semibold tracking-tight text-white">
                  {statsLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  ) : (
                    totalWorkflows
                  )}
                </div>
              </div>

              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/15">
                <GitFork className="w-4 h-4 text-orange-500" />
              </div>

            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-3 text-[10px]">
              <span className="text-emerald-400">
                {activeWorkflowsCount} active
              </span>

              <span className="text-zinc-700">
                /
              </span>

              <span className="text-zinc-500">
                {draftWorkflowsCount} drafts
              </span>

              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 ml-auto group-hover:text-orange-500 transition-colors" />
            </div>

          </div>

          {/* Execution Volume */}
          <div
            onClick={() =>
              navigate('/executions')
            }
            className="group cursor-pointer p-5 rounded-xl bg-[#111214] border border-zinc-800 hover:border-orange-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 font-medium">
                  Executions
                </p>

                <div className="mt-4 flex items-center gap-2">

                  <span className="text-3xl font-semibold tracking-tight text-white">
                    {statsLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    ) : (
                      executionStats?.totalExecutions ||
                      0
                    )}
                  </span>

                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-semibold">
                    {executionStats?.successRate ||
                      100}
                    %
                  </span>

                </div>
              </div>

              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/15">
                <Activity className="w-4 h-4 text-orange-500" />
              </div>

            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-3 text-[10px]">
              <span className="text-emerald-400">
                {executionStats?.successful ||
                  0}{' '}
                successful
              </span>

              <span className="text-zinc-700">
                /
              </span>

              <span className="text-red-400">
                {executionStats?.failed ||
                  0}{' '}
                failed
              </span>

              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 ml-auto group-hover:text-orange-500 transition-colors" />
            </div>

          </div>

          {/* Latency */}
          <div
            onClick={() =>
              navigate('/executions')
            }
            className="group cursor-pointer p-5 rounded-xl bg-[#111214] border border-zinc-800 hover:border-orange-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 font-medium">
                  Engine latency
                </p>

                <div className="mt-4 text-3xl font-semibold tracking-tight text-white">
                  {statsLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  ) : (
                    `${executionStats?.averageDuration ||
                    24
                    } ms`
                  )}
                </div>
              </div>

              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/15">
                <Gauge className="w-4 h-4 text-amber-400" />
              </div>

            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center text-[10px] text-zinc-500">
              Average processing time

              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 ml-auto group-hover:text-orange-500 transition-colors" />
            </div>

          </div>

          {/* Credentials */}
          <div
            onClick={() =>
              navigate('/credentials')
            }
            className="group cursor-pointer p-5 rounded-xl bg-[#111214] border border-zinc-800 hover:border-orange-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 font-medium">
                  Credentials
                </p>

                <div className="mt-4 text-3xl font-semibold tracking-tight text-white">
                  {statsLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  ) : (
                    credentialsCount
                  )}
                </div>
              </div>

              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/15">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
              </div>

            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center text-[10px] text-zinc-500">
              Encrypted credentials

              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 ml-auto group-hover:text-orange-500 transition-colors" />
            </div>

          </div>

        </section>

        {/* ======================================================
            AUTOMATION PROMPT
        ====================================================== */}

        <section className="relative overflow-hidden rounded-xl bg-[#111214] border border-zinc-800">

          <div className="absolute right-0 top-0 w-72 h-40 bg-orange-500/[0.04] blur-[80px] pointer-events-none" />

          <div className="relative p-5 md:p-6">

            <div className="flex flex-col xl:flex-row xl:items-center gap-6">

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2">

                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/15">
                    <Wand2 className="w-4 h-4 text-orange-500" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Describe an automation
                    </h2>

                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Start with a goal and turn it
                      into a workflow.
                    </p>
                  </div>

                </div>

              </div>

              <form
                onSubmit={
                  handleAIGenerate
                }
                className="w-full xl:w-[680px] flex items-center gap-2"
              >

                <div className="relative flex-1">

                  <Sparkles className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />

                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) =>
                      setAiPrompt(
                        e.target.value
                      )
                    }
                    placeholder="e.g. When a new lead arrives, send it to Slack and save it to MongoDB..."
                    className="w-full h-11 bg-[#0b0c0e] border border-zinc-800 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 rounded-lg pl-10 pr-4 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none transition-all"
                  />

                </div>

                <button
                  type="submit"
                  className="h-11 px-5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                >
                  Build
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </form>

            </div>

            {/* Suggestions */}

            <div className="mt-5 pt-4 border-t border-zinc-800">

              <div className="flex items-center gap-2 flex-wrap">

                <span className="text-[9px] uppercase tracking-[0.12em] text-zinc-600 font-semibold mr-1">
                  Examples
                </span>

                {samplePromptSuggestions.map(
                  (item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAiPrompt(
                          item.prompt
                        );

                        navigate(
                          '/ai-builder',
                          {
                            state: {
                              initialPrompt:
                                item.prompt,
                              autoGenerate:
                                true,
                            },
                          }
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-orange-500/10 text-zinc-400 hover:text-orange-400 border border-zinc-800 hover:border-orange-500/20 text-[10px] transition-all"
                    >
                      <Bot className="w-3 h-3 text-orange-500" />
                      {item.title}
                    </button>
                  )
                )}

              </div>

            </div>

          </div>
        </section>

        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* ====================================================
              WORKFLOWS
          ==================================================== */}

          <div className="xl:col-span-2 space-y-4">

            {/* Header */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>

                <div className="flex items-center gap-2">

                  <div className="w-7 h-7 flex items-center justify-center rounded-md bg-zinc-900 border border-zinc-800">
                    <GitFork className="w-3.5 h-3.5 text-orange-500" />
                  </div>

                  <h2 className="text-sm font-semibold text-white">
                    Automation workflows
                  </h2>

                </div>

                <p className="text-[10px] text-zinc-600 mt-1">
                  Manage and run your workflow
                  pipelines.
                </p>

              </div>

              {/* Filter */}

              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">

                {[
                  'all',
                  'active',
                  'draft',
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() =>
                      setWorkflowFilter(
                        tab
                      )
                    }
                    className={`px-3 py-1.5 rounded-md text-[10px] font-medium capitalize transition-all ${workflowFilter ===
                        tab
                        ? 'bg-orange-500 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                  >
                    {tab}
                  </button>
                ))}

              </div>

            </div>

            {/* Search */}

            <div className="relative">

              <Search className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                placeholder="Search workflows..."
                className="w-full h-10 bg-[#111214] border border-zinc-800 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/10 rounded-lg pl-10 pr-4 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none transition-all"
              />

            </div>

            {/* Loading */}

            {workflowsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {[1, 2, 3, 4].map(
                  (i) => (
                    <div
                      key={i}
                      className="h-40 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse"
                    />
                  )
                )}

              </div>
            ) : filteredWorkflows.length ===
              0 ? (

              /* Empty state */

              <div className="p-10 rounded-xl bg-[#111214] border border-zinc-800 text-center">

                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 mx-auto flex items-center justify-center">
                  <GitFork className="w-5 h-5" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-white">
                  No workflows found
                </h3>

                <p className="mt-1 text-xs text-zinc-600 max-w-sm mx-auto">
                  {searchQuery
                    ? 'No workflows match your search.'
                    : 'Create your first workflow to start automating.'}
                </p>

                <button
                  onClick={() =>
                    navigate(
                      '/workflows/create'
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create workflow
                </button>

              </div>

            ) : (

              /* Workflow Cards */

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {filteredWorkflows
                  .slice(0, 6)
                  .map((wf) => (

                    <div
                      key={wf._id}
                      onClick={() =>
                        navigate(
                          `/builder/${wf._id}`
                        )
                      }
                      className="group relative cursor-pointer p-4 rounded-xl bg-[#111214] border border-zinc-800 hover:border-orange-500/30 transition-all duration-200 hover:-translate-y-0.5"
                    >

                      {/* Top */}

                      <div className="flex items-start justify-between gap-3">

                        <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/15 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-orange-500" />
                        </div>

                        <span
                          className={`px-2 py-1 rounded-md text-[9px] font-medium border ${wf.status ===
                              'active' ||
                              wf.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                            }`}
                        >
                          {wf.status ===
                            'active' ||
                            wf.isActive
                            ? 'Active'
                            : 'Draft'}
                        </span>

                      </div>

                      {/* Content */}

                      <div className="mt-4">

                        <h3 className="text-sm font-medium text-zinc-200 group-hover:text-orange-400 transition-colors line-clamp-1">
                          {wf.name ||
                            'Untitled Automation'}
                        </h3>

                        <p className="text-[11px] text-zinc-600 line-clamp-2 mt-1.5 leading-relaxed">
                          {wf.description ||
                            'Automation workflow.'}
                        </p>

                      </div>

                      {/* Bottom */}

                      <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between">

                        <span className="text-[9px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">
                          {wf.nodes?.length ||
                            wf.definition
                              ?.nodes
                              ?.length ||
                            3}{' '}
                          nodes
                        </span>

                        <div className="flex items-center gap-1.5">

                          {/* Run */}

                          <button
                            onClick={(e) =>
                              handleQuickRun(
                                wf._id,
                                e
                              )
                            }
                            disabled={
                              runningWorkflowId ===
                              wf._id
                            }
                            title="Run workflow"
                            className="px-2.5 py-1.5 rounded-md bg-orange-500/10 hover:bg-orange-500/15 text-orange-400 border border-orange-500/20 text-[10px] font-medium flex items-center gap-1.5 transition-all"
                          >
                            {runningWorkflowId ===
                              wf._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3 fill-current" />
                            )}

                            Run
                          </button>

                          {/* Edit */}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              navigate(
                                `/builder/${wf._id}`
                              );
                            }}
                            title="Edit workflow"
                            className="px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 border border-zinc-800 text-[10px] font-medium transition-all"
                          >
                            Edit
                          </button>

                          {/* Duplicate */}

                          <button
                            onClick={(e) =>
                              handleDuplicateWorkflow(
                                wf._id,
                                e
                              )
                            }
                            title="Duplicate workflow"
                            className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-600 hover:text-orange-500 hover:bg-orange-500/10 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                        </div>

                      </div>

                    </div>
                  ))}

              </div>
            )}

            {/* View all */}

            {workflows.length > 6 && (
              <div className="pt-1">

                <button
                  onClick={() =>
                    navigate(
                      '/workflows'
                    )
                  }
                  className="inline-flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 hover:text-orange-500 transition-colors"
                >
                  View all {totalWorkflows}{' '}
                  workflows
                  <ChevronRight className="w-3 h-3" />
                </button>

              </div>
            )}

          </div>

          {/* ====================================================
              RIGHT SIDEBAR
          ==================================================== */}

          <div className="space-y-4">

            {/* Recent executions */}

            <div className="p-5 rounded-xl bg-[#111214] border border-zinc-800">

              <div className="flex items-center justify-between mb-4">

                <div className="flex items-center gap-2">

                  <Activity className="w-4 h-4 text-orange-500" />

                  <h3 className="text-sm font-semibold text-white">
                    Recent executions
                  </h3>

                </div>

                <button
                  onClick={() =>
                    navigate(
                      '/executions'
                    )
                  }
                  className="text-[10px] text-zinc-600 hover:text-orange-500 transition-colors"
                >
                  View all
                </button>

              </div>

              {executionsLoading ? (

                <div className="space-y-2">

                  {[1, 2, 3].map(
                    (i) => (
                      <div
                        key={i}
                        className="h-12 bg-zinc-900 rounded-lg animate-pulse"
                      />
                    )
                  )}

                </div>

              ) : recentExecutions.length ===
                0 ? (

                <div className="py-8 text-center">

                  <Terminal className="w-6 h-6 mx-auto text-zinc-700" />

                  <p className="mt-2 text-xs text-zinc-600">
                    No recent executions
                  </p>

                  <p className="text-[10px] text-zinc-700 mt-1">
                    Run a workflow to see activity.
                  </p>

                </div>

              ) : (

                <div className="space-y-1.5">

                  {recentExecutions.map(
                    (exec) => (

                      <div
                        key={exec._id}
                        onClick={() =>
                          navigate(
                            '/executions'
                          )
                        }
                        className="p-3 rounded-lg bg-zinc-900/60 hover:bg-orange-500/[0.04] border border-zinc-800 hover:border-orange-500/20 transition-all cursor-pointer flex items-center justify-between gap-3"
                      >

                        <div className="min-w-0 flex-1">

                          <div className="text-[11px] font-medium text-zinc-300 truncate">
                            {exec.workflowName ||
                              exec.workflow
                                ?.name ||
                              'Untitled Automation'}
                          </div>

                          <div className="flex items-center gap-2 text-[9px] text-zinc-600 mt-1">

                            <span className="uppercase">
                              {exec.triggerType ||
                                'manual'}
                            </span>

                            <span>·</span>

                            <span>
                              {exec.duration ||
                                18}
                              ms
                            </span>

                            <span>·</span>

                            <span>
                              {new Date(
                                exec.startedAt ||
                                exec.createdAt
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour:
                                    '2-digit',
                                  minute:
                                    '2-digit',
                                }
                              )}
                            </span>

                          </div>

                        </div>

                        {getStatusBadge(
                          exec.status
                        )}

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* Templates */}

            <div className="p-5 rounded-xl bg-[#111214] border border-zinc-800">

              <div className="flex items-center justify-between mb-4">

                <div className="flex items-center gap-2">

                  <Layers className="w-4 h-4 text-orange-500" />

                  <h3 className="text-sm font-semibold text-white">
                    Starter templates
                  </h3>

                </div>

                <button
                  onClick={() =>
                    navigate(
                      '/templates'
                    )
                  }
                  className="text-[10px] text-zinc-600 hover:text-orange-500 transition-colors"
                >
                  Browse
                </button>

              </div>

              <div className="space-y-2">

                {starterTemplates.length >
                  0 ? (

                  starterTemplates.map(
                    (tpl) => (

                      <div
                        key={tpl._id}
                        className="group p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-orange-500/20 transition-all flex items-center justify-between gap-3"
                      >

                        <div className="min-w-0 flex-1">

                          <div className="text-[11px] font-medium text-zinc-300 group-hover:text-orange-400 transition-colors truncate">
                            {tpl.name}
                          </div>

                          <p className="text-[9px] text-zinc-600 line-clamp-1 mt-1">
                            {tpl.description}
                          </p>

                        </div>

                        <button
                          onClick={() =>
                            handleInstantiateTemplate(
                              tpl._id
                            )
                          }
                          className="px-2.5 py-1.5 rounded-md bg-orange-500/10 hover:bg-orange-500/15 text-orange-400 border border-orange-500/20 text-[10px] font-medium flex items-center gap-1 transition-all"
                        >
                          <Copy className="w-3 h-3" />
                          Use
                        </button>

                      </div>
                    )
                  )

                ) : (

                  <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">

                    <p className="text-[10px] text-zinc-600">
                      Explore ready-to-run
                      workflow templates.
                    </p>

                    <button
                      onClick={() =>
                        navigate(
                          '/templates'
                        )
                      }
                      className="mt-3 px-3 py-1.5 rounded-md bg-orange-500 hover:bg-orange-400 text-white text-[10px] font-medium transition-all"
                    >
                      Browse templates
                    </button>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

        {/* ======================================================
            CONNECTED APPS
        ====================================================== */}

        <section className="p-5 md:p-6 rounded-xl bg-[#111214] border border-zinc-800">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>

              <div className="flex items-center gap-2">

                <div className="w-7 h-7 flex items-center justify-center rounded-md bg-zinc-900 border border-zinc-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                </div>

                <h3 className="text-sm font-semibold text-white">
                  Connected apps
                </h3>

              </div>

              <p className="text-[10px] text-zinc-600 mt-1">
                Connect the services your workflows
                depend on.
              </p>

            </div>

            <button
              onClick={() =>
                navigate(
                  '/credentials'
                )
              }
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-orange-500 text-[10px] font-medium transition-all"
            >
              Manage credentials
              <ArrowRight className="w-3 h-3" />
            </button>

          </div>

          {/* Apps */}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mt-5">

            {[
              {
                name: 'Google Sheets',
                icon: FileSpreadsheet,
                color:
                  'text-emerald-400 bg-emerald-500/10 border-emerald-500/15',
              },
              {
                name: 'Gmail',
                icon: Mail,
                color:
                  'text-red-400 bg-red-500/10 border-red-500/15',
              },
              {
                name: 'Discord',
                icon: MessageSquare,
                color:
                  'text-indigo-400 bg-indigo-500/10 border-indigo-500/15',
              },
              {
                name: 'Slack',
                icon: MessageSquare,
                color:
                  'text-amber-400 bg-amber-500/10 border-amber-500/15',
              },
              {
                name: 'Webhooks',
                icon: Zap,
                color:
                  'text-orange-400 bg-orange-500/10 border-orange-500/15',
              },
              {
                name: 'MongoDB / SQL',
                icon: Database,
                color:
                  'text-purple-400 bg-purple-500/10 border-purple-500/15',
              },
            ].map(
              (app, i) => {
                const Icon =
                  app.icon;

                return (
                  <div
                    key={i}
                    onClick={() =>
                      navigate(
                        '/credentials'
                      )
                    }
                    className="group p-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-orange-500/20 transition-all cursor-pointer flex items-center gap-2.5"
                  >

                    <div
                      className={`w-8 h-8 rounded-md border flex items-center justify-center ${app.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <span className="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors truncate">
                      {app.name}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        </section>

      </div>
    </div>
  );
};

export default Dashboard;