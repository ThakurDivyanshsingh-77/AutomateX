import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Play,
  Trash2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Activity,
  Inbox,
  Flame,
  Loader2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { reliabilityService } from '../services/reliabilityService';
import toast from 'react-hot-toast';

export const ReliabilityDashboard = () => {
  const [activeTab, setActiveTab] = useState('failures'); // 'failures' | 'dlq' | 'cron'
  const [stats, setStats] = useState({
    total: 0,
    running: 0,
    succeeded: 0,
    failed: 0,
    recovered: 0,
    timeout: 0,
    deadLetter: 0,
    successRate: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Failed Executions state
  const [failures, setFailures] = useState([]);
  const [loadingFailures, setLoadingFailures] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [failurePage, setFailurePage] = useState(1);
  const [failurePages, setFailurePages] = useState(1);
  const [retryingId, setRetryingId] = useState(null);
  const [resumingId, setResumingId] = useState(null);

  // Dead Letter Queue state
  const [dlqItems, setDlqItems] = useState([]);
  const [loadingDlq, setLoadingDlq] = useState(true);
  const [dlqPage, setDlqPage] = useState(1);
  const [dlqPages, setDlqPages] = useState(1);
  const [replayingDlqId, setReplayingDlqId] = useState(null);
  const [deletingDlqId, setDeletingDlqId] = useState(null);

  // Cron Scheduler state
  const [cronStatus, setCronStatus] = useState({ running: false, registeredJobsCount: 0, jobs: [] });
  const [loadingCron, setLoadingCron] = useState(false);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await reliabilityService.getStats();
      if (res.stats) setStats(res.stats);
    } catch (err) {
      toast.error('Failed to load reliability metrics');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch failed executions
  const fetchFailures = useCallback(async () => {
    setLoadingFailures(true);
    try {
      const res = await reliabilityService.getFailedExecutions({
        page: failurePage,
        limit: 10,
        search: searchQuery,
      });
      setFailures(res.failures || []);
      setFailurePages(res.pages || 1);
    } catch (err) {
      toast.error('Failed to load failure logs');
    } finally {
      setLoadingFailures(false);
    }
  }, [failurePage, searchQuery]);

  // Fetch DLQ items
  const fetchDlq = useCallback(async () => {
    setLoadingDlq(true);
    try {
      const res = await reliabilityService.getDeadLetterQueue({
        page: dlqPage,
        limit: 10,
      });
      setDlqItems(res.items || []);
      setDlqPages(res.pages || 1);
    } catch (err) {
      toast.error('Failed to load Dead Letter Queue');
    } finally {
      setLoadingDlq(false);
    }
  }, [dlqPage]);

  // Fetch Cron status
  const fetchCronStatus = useCallback(async () => {
    setLoadingCron(true);
    try {
      const res = await reliabilityService.getCronStatus();
      setCronStatus(res);
    } catch (err) {
      toast.error('Failed to load Cron Scheduler status');
    } finally {
      setLoadingCron(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchCronStatus();
  }, [fetchStats, fetchCronStatus]);

  useEffect(() => {
    if (activeTab === 'failures') {
      fetchFailures();
    } else if (activeTab === 'dlq') {
      fetchDlq();
    } else if (activeTab === 'cron') {
      fetchCronStatus();
    }
  }, [activeTab, fetchFailures, fetchDlq, fetchCronStatus]);

  // Handlers for retry & resume
  const handleRetryExecution = async (id) => {
    setRetryingId(id);
    try {
      await reliabilityService.retryExecution(id);
      toast.success('Execution retry triggered!');
      fetchStats();
      fetchFailures();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Retry failed');
    } finally {
      setRetryingId(null);
    }
  };

  const handleResumeExecution = async (id) => {
    setResumingId(id);
    try {
      const res = await reliabilityService.resumeExecution(id);
      toast.success(res.message || 'Workflow execution resumed!');
      fetchStats();
      fetchFailures();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resume failed');
    } finally {
      setResumingId(null);
    }
  };

  // Handlers for DLQ
  const handleReplayDlq = async (id) => {
    setReplayingDlqId(id);
    try {
      const res = await reliabilityService.replayDeadLetterItem(id);
      toast.success(res.message || 'Dead letter item replayed!');
      fetchStats();
      fetchDlq();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Replay failed');
    } finally {
      setReplayingDlqId(null);
    }
  };

  const handleDeleteDlq = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Dead Letter item?')) return;
    setDeletingDlqId(id);
    try {
      await reliabilityService.deleteDeadLetterItem(id);
      toast.success('Item removed from Dead Letter Queue');
      fetchStats();
      fetchDlq();
    } catch (err) {
      toast.error('Failed to delete item');
    } finally {
      setDeletingDlqId(null);
    }
  };

  const getErrorBadge = (errorType) => {
    switch (errorType) {
      case 'timeout':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">TIMEOUT</span>;
      case 'network':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">NETWORK</span>;
      case 'auth':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">AUTH</span>;
      case 'rate_limit':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">RATE LIMIT</span>;
      case 'server_error':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">5XX SERVER</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">ERROR</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none font-sans text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-amber-500/10 blur-[70px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            Reliability & Recovery Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Automated node retries, per-node timeouts, error classification, dead letter queue, and execution recovery.
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            if (activeTab === 'failures') fetchFailures();
            else fetchDlq();
          }}
          className="px-3.5 py-2.5 glass-panel-subtle hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700/60 transition-colors relative z-10 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="glass-card border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-brand-400" /> Total Executions
          </div>
          <div className="text-2xl font-extrabold font-mono text-white mt-2">
            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-brand-400" /> : stats.total}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">{stats.successRate}% success rate</div>
        </div>

        <div className="glass-card border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Succeeded
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-2">
            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-brand-400" /> : stats.succeeded}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1 font-mono">Completed cleanly</div>
        </div>

        <div className="glass-card border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" /> Auto-Recovered
          </div>
          <div className="text-2xl font-extrabold font-mono text-cyan-400 mt-2">
            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-brand-400" /> : stats.recovered}
          </div>
          <div className="text-[10px] text-cyan-400/80 mt-1 font-mono">Succeeded on retry</div>
        </div>

        <div className="glass-card border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Timeouts
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400 mt-2">
            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-brand-400" /> : stats.timeout}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-1 font-mono">Exceeded node limit</div>
        </div>

        <div className="glass-card border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-400" /> Failed
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-400 mt-2">
            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-brand-400" /> : stats.failed}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-1 font-mono">Halted executions</div>
        </div>

        <div className="glass-card border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Inbox className="w-3.5 h-3.5 text-amber-400" /> Dead Letter Q
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400 mt-2">
            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-brand-400" /> : stats.deadLetter}
          </div>
          <div className="text-[10px] text-amber-300/80 mt-1 font-mono">Awaiting replay</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('failures')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'failures'
              ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-glow-brand'
              : 'glass-panel-subtle text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Failed Executions & Recovery
        </button>

        <button
          onClick={() => setActiveTab('dlq')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'dlq'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-glow-brand'
              : 'glass-panel-subtle text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Inbox className="w-4 h-4" /> Dead Letter Queue
          {stats.deadLetter > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500 text-white">
              {stats.deadLetter}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('cron')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'cron'
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-glow-indigo'
              : 'glass-panel-subtle text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" /> Cron Scheduler
          {cronStatus?.registeredJobsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500 text-white">
              {cronStatus.registeredJobsCount} Active
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Failed Executions */}
      {activeTab === 'failures' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setFailurePage(1);
              }}
              placeholder="Search by workflow name or error message..."
              className="bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none w-full"
            />
          </div>

          {/* Failures Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {loadingFailures ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                Loading failure logs...
              </div>
            ) : failures.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <ShieldCheck className="w-10 h-10 text-emerald-500/40" />
                <span className="font-semibold text-slate-300">No failed executions found</span>
                <span className="text-slate-500">All workflow runs completed cleanly!</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 pl-5">Workflow</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Error Message</th>
                      <th className="p-3.5">Retries</th>
                      <th className="p-3.5">Time</th>
                      <th className="p-3.5 pr-5 text-right">Recovery Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {failures.map((exec) => (
                      <tr key={exec._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 pl-5">
                          <div className="font-bold text-white text-xs">{exec.workflowName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">ID: {exec._id}</div>
                        </td>
                        <td className="p-3.5">
                          {exec.status === 'timeout' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              TIMEOUT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              FAILED
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <div className="text-rose-300 font-mono text-[11px] truncate" title={exec.error?.message}>
                            {exec.error?.message || 'Execution error'}
                          </div>
                          {exec.error?.nodeId && (
                            <div className="text-[10px] text-slate-500">at node: {exec.error.nodeId}</div>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-300">
                          {exec.totalRetryAttempts > 0 ? (
                            <span className="text-amber-400 font-bold">{exec.totalRetryAttempts} attempt{exec.totalRetryAttempts > 1 ? 's' : ''}</span>
                          ) : (
                            <span className="text-slate-500">0</span>
                          )}
                        </td>
                        <td className="p-3.5 text-[11px] text-slate-400">
                          {new Date(exec.startedAt || exec.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRetryExecution(exec._id)}
                              disabled={retryingId === exec._id}
                              className="px-2.5 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                              title="Re-run workflow from trigger"
                            >
                              {retryingId === exec._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                              Retry
                            </button>

                            <button
                              onClick={() => handleResumeExecution(exec._id)}
                              disabled={resumingId === exec._id}
                              className="px-2.5 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                              title="Resume workflow execution"
                            >
                              {resumingId === exec._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                              Resume
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination footer */}
            {failurePages > 1 && (
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Page {failurePage} of {failurePages}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFailurePage((p) => Math.max(1, p - 1))}
                    disabled={failurePage === 1}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setFailurePage((p) => Math.min(failurePages, p + 1))}
                    disabled={failurePage === failurePages}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Dead Letter Queue */}
      {activeTab === 'dlq' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">About Dead Letter Queue</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Executions that permanently fail after all retry attempts land here. You can inspect the exact payload, replay the execution, or purge resolved items.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {loadingDlq ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                Loading Dead Letter Queue...
              </div>
            ) : dlqItems.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <Inbox className="w-10 h-10 text-slate-700" />
                <span className="font-semibold text-slate-300">Dead Letter Queue is empty</span>
                <span className="text-slate-500">No permanently failed executions queued.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 pl-5">Workflow</th>
                      <th className="p-3.5">Failed Node</th>
                      <th className="p-3.5">Error Classification</th>
                      <th className="p-3.5">Retries</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 pr-5 text-right">DLQ Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {dlqItems.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 pl-5">
                          <div className="font-bold text-white text-xs">{item.workflowName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Exec ID: {item.executionId}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-mono text-slate-200 text-xs">{item.failedNodeId || 'Unknown'}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{item.failedNodeType}</div>
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <div className="flex items-center gap-1.5 mb-1">
                            {getErrorBadge(item.error?.type)}
                            {item.error?.retryable && (
                              <span className="text-[9px] text-emerald-400 font-mono">(Retryable)</span>
                            )}
                          </div>
                          <div className="text-rose-300 font-mono text-[11px] truncate" title={item.error?.message}>
                            {item.error?.message}
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-xs text-slate-300 font-bold">
                          {item.retryCount || 0}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            item.status === 'dead' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            item.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {item.status ? item.status.toUpperCase() : 'QUEUED'}
                          </span>
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleReplayDlq(item._id)}
                              disabled={replayingDlqId === item._id || item.status === 'resolved'}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors disabled:opacity-40"
                              title="Replay workflow with original payload"
                            >
                              {replayingDlqId === item._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                              Replay
                            </button>

                            <button
                              onClick={() => handleDeleteDlq(item._id)}
                              disabled={deletingDlqId === item._id}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                              title="Delete from DLQ"
                            >
                              {deletingDlqId === item._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Cron Scheduler */}
      {activeTab === 'cron' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-emerald-300">Production Cron Scheduler</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    cronStatus.running ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {cronStatus.running ? 'RUNNING' : 'STOPPED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Automatically triggers published workflows based on cron schedules. Survives server restarts and provides overlap protection.
                </p>
              </div>
            </div>

            <button
              onClick={async () => {
                try {
                  await reliabilityService.reloadCronJobs();
                  toast.success('Cron jobs reloaded!');
                  fetchCronStatus();
                } catch (e) {
                  toast.error('Reload failed');
                }
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload Schedules
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {loadingCron ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                Loading Cron Jobs...
              </div>
            ) : !cronStatus.jobs || cronStatus.jobs.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <Clock className="w-10 h-10 text-slate-700" />
                <span className="font-semibold text-slate-300">No active Cron Jobs</span>
                <span className="text-slate-500">Publish a workflow with a Cron Trigger node to activate scheduling.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 pl-5">Workflow</th>
                      <th className="p-3.5">Cron Syntax</th>
                      <th className="p-3.5">Human Schedule</th>
                      <th className="p-3.5">Timezone</th>
                      <th className="p-3.5">Next Execution</th>
                      <th className="p-3.5 pr-5 text-right">Run Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {cronStatus.jobs.map((job) => (
                      <tr key={job.workflowId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 pl-5">
                          <div className="font-bold text-white text-xs">{job.workflowName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">ID: {job.workflowId}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {job.cronExpression}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-slate-200">
                          {job.humanReadable}
                        </td>
                        <td className="p-3.5 font-mono text-slate-400 text-xs">
                          {job.timezone}
                        </td>
                        <td className="p-3.5 text-[11px] text-emerald-400 font-mono">
                          {job.nextRun ? new Date(job.nextRun).toLocaleString() : 'Pending'}
                        </td>
                        <td className="p-3.5 pr-5 text-right font-mono font-bold text-slate-300">
                          {job.runCount || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReliabilityDashboard;
