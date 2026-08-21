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
    <div className="space-y-6 max-w-7xl mx-auto select-none font-sans text-slate-900">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-amber-500/5 blur-[70px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-brand-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            Reliability & Recovery Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Automated node retries, per-node timeouts, error classification, dead letter queue, and execution recovery.
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            if (activeTab === 'failures') fetchFailures();
            else fetchDlq();
          }}
          className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-200 transition-colors relative z-10 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-brand-600" /> Total Executions
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-brand-600" /> : stats.total}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">{stats.successRate}% success rate</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Succeeded
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-600 mt-2">
            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-brand-600" /> : stats.succeeded}
          </div>
          <div className="text-[10px] text-emerald-700 mt-1 font-mono">Completed cleanly</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-cyan-600" /> Auto-Recovered
          </div>
          <div className="text-2xl font-extrabold font-mono text-cyan-600 mt-2">
            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-brand-600" /> : stats.recovered}
          </div>
          <div className="text-[10px] text-cyan-700 mt-1 font-mono">Succeeded on retry</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Timeouts
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-600 mt-2">
            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-brand-600" /> : stats.timeout}
          </div>
          <div className="text-[10px] text-amber-700 mt-1 font-mono">Exceeded node limit</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Failed
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-600 mt-2">
            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-brand-600" /> : stats.failed}
          </div>
          <div className="text-[10px] text-rose-700 mt-1 font-mono">Halted executions</div>
        </div>

        <div className="bg-white border border-orange-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-bold text-orange-700 uppercase tracking-wider flex items-center gap-1.5">
            <Inbox className="w-3.5 h-3.5 text-orange-600" /> Dead Letter Q
          </div>
          <div className="text-2xl font-extrabold font-mono text-orange-600 mt-2">
            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-brand-600" /> : stats.deadLetter}
          </div>
          <div className="text-[10px] text-orange-700 mt-1 font-mono">Awaiting replay</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('failures')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'failures'
              ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Failed Executions & Recovery
        </button>

        <button
          onClick={() => setActiveTab('dlq')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'dlq'
              ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
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
              ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
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
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setFailurePage(1);
              }}
              placeholder="Search by workflow name or error message..."
              className="bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>

          {/* Failures Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {loadingFailures ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                Loading failure logs...
              </div>
            ) : failures.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <ShieldCheck className="w-10 h-10 text-emerald-500/40" />
                <span className="font-bold text-slate-800">No failed executions found</span>
                <span className="text-slate-500">All workflow runs completed cleanly!</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 pl-5">Workflow</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Error Message</th>
                      <th className="p-3.5">Retries</th>
                      <th className="p-3.5">Time</th>
                      <th className="p-3.5 pr-5 text-right">Recovery Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {failures.map((exec) => (
                      <tr key={exec._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 pl-5 font-sans">
                          <div className="font-bold text-slate-900 text-xs">{exec.workflowName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {exec._id}</div>
                        </td>
                        <td className="p-3.5">
                          {exec.status === 'timeout' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              TIMEOUT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              FAILED
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <div className="text-rose-600 font-mono text-[11px] truncate" title={exec.error?.message}>
                            {exec.error?.message || 'Execution error'}
                          </div>
                          {exec.error?.nodeId && (
                            <div className="text-[10px] text-slate-400 font-sans">at node: {exec.error.nodeId}</div>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-700">
                          {exec.totalRetryAttempts > 0 ? (
                            <span className="text-amber-600 font-bold">{exec.totalRetryAttempts} attempt{exec.totalRetryAttempts > 1 ? 's' : ''}</span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="p-3.5 text-[11px] text-slate-500 font-sans">
                          {new Date(exec.startedAt || exec.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3.5 pr-5 text-right font-sans">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRetryExecution(exec._id)}
                              disabled={retryingId === exec._id}
                              className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50 shadow-sm"
                              title="Re-run workflow from trigger"
                            >
                              {retryingId === exec._id ? <Loader2 className="w-3 h-3 animate-spin text-orange-600" /> : <RotateCcw className="w-3 h-3 text-orange-600" />}
                              Retry
                            </button>

                            <button
                              onClick={() => handleResumeExecution(exec._id)}
                              disabled={resumingId === exec._id}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50 shadow-sm"
                              title="Resume workflow execution"
                            >
                              {resumingId === exec._id ? <Loader2 className="w-3 h-3 animate-spin text-emerald-600" /> : <Play className="w-3 h-3 text-emerald-600" />}
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
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Page {failurePage} of {failurePages}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFailurePage((p) => Math.max(1, p - 1))}
                    disabled={failurePage === 1}
                    className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-40 shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setFailurePage((p) => Math.min(failurePages, p + 1))}
                    disabled={failurePage === failurePages}
                    className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-40 shadow-sm"
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
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-orange-800">About Dead Letter Queue</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Executions that permanently fail after all retry attempts land here. You can inspect the exact payload, replay the execution, or purge resolved items.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {loadingDlq ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                Loading Dead Letter Queue...
              </div>
            ) : dlqItems.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <Inbox className="w-10 h-10 text-slate-300" />
                <span className="font-bold text-slate-800">Dead Letter Queue is empty</span>
                <span className="text-slate-500">No permanently failed executions queued.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 pl-5">Workflow</th>
                      <th className="p-3.5">Failed Node</th>
                      <th className="p-3.5">Error Classification</th>
                      <th className="p-3.5">Retries</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 pr-5 text-right">DLQ Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {dlqItems.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 pl-5 font-sans">
                          <div className="font-bold text-slate-900 text-xs">{item.workflowName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Exec ID: {item.executionId}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-mono text-slate-800 text-xs">{item.failedNodeId || 'Unknown'}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{item.failedNodeType}</div>
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <div className="flex items-center gap-1.5 mb-1">
                            {getErrorBadge(item.error?.type)}
                            {item.error?.retryable && (
                              <span className="text-[9px] text-emerald-600 font-mono font-bold">(Retryable)</span>
                            )}
                          </div>
                          <div className="text-rose-600 font-mono text-[11px] truncate" title={item.error?.message}>
                            {item.error?.message}
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-xs text-slate-800 font-bold">
                          {item.retryCount || 0}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            item.status === 'dead' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            item.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}>
                            {item.status ? item.status.toUpperCase() : 'QUEUED'}
                          </span>
                        </td>
                        <td className="p-3.5 pr-5 text-right font-sans">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleReplayDlq(item._id)}
                              disabled={replayingDlqId === item._id || item.status === 'resolved'}
                              className="px-2.5 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors disabled:opacity-40 shadow-sm"
                              title="Replay workflow with original payload"
                            >
                              {replayingDlqId === item._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                              Replay
                            </button>

                            <button
                              onClick={() => handleDeleteDlq(item._id)}
                              disabled={deletingDlqId === item._id}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
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
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-emerald-800">Production Cron Scheduler</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    cronStatus.running ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {cronStatus.running ? 'RUNNING' : 'STOPPED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
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
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors flex-shrink-0 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-brand-600" /> Reload Schedules
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {loadingCron ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                Loading Cron Jobs...
              </div>
            ) : !cronStatus.jobs || cronStatus.jobs.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <Clock className="w-10 h-10 text-slate-300" />
                <span className="font-bold text-slate-800">No active Cron Jobs</span>
                <span className="text-slate-500">Publish a workflow with a Cron Trigger node to activate scheduling.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 pl-5">Workflow</th>
                      <th className="p-3.5">Cron Syntax</th>
                      <th className="p-3.5">Human Schedule</th>
                      <th className="p-3.5">Timezone</th>
                      <th className="p-3.5">Next Execution</th>
                      <th className="p-3.5 pr-5 text-right">Run Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {cronStatus.jobs.map((job) => (
                      <tr key={job.workflowId} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 pl-5 font-sans">
                          <div className="font-bold text-slate-900 text-xs">{job.workflowName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {job.workflowId}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-50 text-orange-700 border border-orange-200">
                            {job.cronExpression}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800 font-sans">
                          {job.humanReadable}
                        </td>
                        <td className="p-3.5 font-mono text-slate-500 text-xs">
                          {job.timezone}
                        </td>
                        <td className="p-3.5 text-[11px] text-emerald-600 font-mono font-bold">
                          {job.nextRun ? new Date(job.nextRun).toLocaleString() : 'Pending'}
                        </td>
                        <td className="p-3.5 pr-5 text-right font-mono font-bold text-slate-800">
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
