import React, { useEffect, useState, useCallback } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Terminal,
  Zap,
  TrendingUp,
  Layers
} from 'lucide-react';
import { executionService } from '../../workflow/services/executionService';
import { ExecutionDetailsDrawer } from '../components/ExecutionDetailsDrawer';
import toast from 'react-hot-toast';

export const Executions = () => {
  const [executions, setExecutions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [triggerFilter, setTriggerFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Drawer / Inspection State
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // 1. Fetch Summary Stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await executionService.getExecutionStats();
      setStats(res.stats || null);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // 2. Fetch Executions List
  const fetchExecutions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await executionService.getExecutions({
        page,
        limit: 15,
        search,
        status: statusFilter,
        triggerType: triggerFilter,
        dateFilter,
      });

      setExecutions(res.data || res.executions || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      toast.error('Failed to load execution history');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, triggerFilter, dateFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  // Handle Replay Workflow Execution
  const handleReplay = async (executionId) => {
    try {
      const res = await executionService.replayExecution(executionId);
      toast.success('Workflow execution replayed!');
      fetchStats();
      fetchExecutions();
      if (res.executionId) {
        handleInspect(res.executionId);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Replay failed');
    }
  };

  // Handle Delete Record
  const handleDelete = async (executionId) => {
    if (!window.confirm('Are you sure you want to delete this execution log?')) return;
    try {
      await executionService.deleteExecution(executionId);
      toast.success('Execution log deleted');
      fetchStats();
      fetchExecutions();
      if (selectedExecution?._id === executionId) {
        setSelectedExecution(null);
      }
    } catch (err) {
      toast.error('Failed to delete execution record');
    }
  };

  // Open Detailed Execution Drawer
  const handleInspect = async (executionId) => {
    setDrawerLoading(true);
    try {
      const res = await executionService.getExecutionById(executionId);
      setSelectedExecution(res.execution || res);
    } catch (err) {
      toast.error('Failed to load detailed log payload');
    } finally {
      setDrawerLoading(false);
    }
  };

  // Export full current page logs to JSON
  const handleExportPageJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(executions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `executions_page_${page}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Page executions exported as JSON!');
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'success' || s === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> Success
        </span>
      );
    }
    if (s === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertCircle className="w-3 h-3" /> Failed
        </span>
      );
    }
    if (s === 'running' || s === 'queued' || s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Loader2 className="w-3 h-3 animate-spin" /> {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
        {status}
      </span>
    );
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-6 max-w-7xl mx-auto select-none text-slate-900 font-sans">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-1/3 w-80 h-32 bg-orange-500/5 blur-[70px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200">
              <Activity className="w-5 h-5" />
            </div>
            Execution History & Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Inspect, audit, monitor, and replay workflow execution runs across your platform.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 w-full sm:w-auto">
          <button
            onClick={fetchExecutions}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-600' : ''}`} /> Refresh
          </button>

          <button
            onClick={handleExportPageJSON}
            disabled={executions.length === 0}
            className="px-3.5 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 transition-colors flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>
        </div>
      </div>

      {/* ── Metric Summary Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Executions</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
            {statsLoading ? <Loader2 className="w-5 h-5 animate-spin text-brand-600" /> : stats?.totalExecutions || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Success Rate</span>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-2 flex items-center gap-1">
            {statsLoading ? <Loader2 className="w-5 h-5 animate-spin text-brand-600" /> : `${stats?.successRate || 0}%`}
            <TrendingUp className="w-4 h-4 text-emerald-600 ml-1" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Successful Runs</span>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-2">
            {statsLoading ? <Loader2 className="w-5 h-5 animate-spin text-brand-600" /> : stats?.successful || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Failed Runs</span>
          <div className="text-2xl font-extrabold text-rose-600 font-mono mt-2">
            {statsLoading ? <Loader2 className="w-5 h-5 animate-spin text-brand-600" /> : stats?.failed || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm col-span-2 md:col-span-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average Duration</span>
          <div className="text-2xl font-extrabold text-orange-600 font-mono mt-2 flex items-center gap-1">
            <Clock className="w-4 h-4 text-orange-600" />
            {statsLoading ? <Loader2 className="w-5 h-5 animate-spin text-brand-600" /> : `${stats?.averageDuration || 0} ms`}
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls Toolbar ────────────────────────────── */}
      <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 flex-wrap shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by workflow name, execution ID, or status..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all shadow-inner"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer shadow-sm"
          >
            <option value="all">All Statuses</option>
            <option value="success">🟢 Success</option>
            <option value="failed">🔴 Failed</option>
            <option value="running">🟡 Running</option>
            <option value="pending">⚪ Pending</option>
          </select>
        </div>

        {/* Trigger Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trigger:</span>
          <select
            value={triggerFilter}
            onChange={(e) => {
              setTriggerFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer shadow-sm"
          >
            <option value="all">All Triggers</option>
            <option value="webhook">⚡ Webhook</option>
            <option value="manual">🖐️ Manual</option>
            <option value="schedule">⏰ Schedule</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date:</span>
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer shadow-sm"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* ── Executions Table ────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Execution ID</th>
                <th className="py-3 px-4">Workflow</th>
                <th className="py-3 px-4">Trigger</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Started At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-sans text-xs">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-600" />
                    Fetching execution logs...
                  </td>
                </tr>
              ) : executions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-sans text-xs">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No execution records found matching your filters.
                  </td>
                </tr>
              ) : (
                executions.map((exec) => (
                  <tr key={exec._id} className="hover:bg-slate-50 transition-colors">
                    {/* Execution ID */}
                    <td className="py-3 px-4 font-bold text-brand-600 truncate max-w-[140px]">
                      {exec._id}
                    </td>

                    {/* Workflow Name */}
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900 truncate max-w-[180px]">
                      {exec.workflowName || exec.workflow?.name || 'Untitled Workflow'}
                    </td>

                    {/* Trigger Type */}
                    <td className="py-3 px-4 font-sans text-slate-500">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {exec.triggerType || 'manual'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 font-sans">
                      {getStatusBadge(exec.status)}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4 text-slate-700">
                      {exec.duration || 0} ms
                    </td>

                    {/* Started At */}
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(exec.startedAt || exec.createdAt).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right font-sans space-x-1">
                      <button
                        onClick={() => handleInspect(exec._id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        Inspect Log
                      </button>

                      <button
                        onClick={() => handleReplay(exec._id)}
                        className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-[11px] font-semibold transition-colors"
                        title="Replay Execution"
                      >
                        <Play className="w-3 h-3 fill-orange-600 inline" />
                      </button>

                      <button
                        onClick={() => handleDelete(exec._id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-sans">
          <span>
            Showing <strong className="text-slate-900">{executions.length}</strong> of <strong className="text-slate-900">{total}</strong> total logs
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[11px]">
              Page <strong>{page}</strong> of <strong>{pages}</strong>
            </span>

            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages || loading}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Slide-over Detailed Log Inspector Drawer */}
      {selectedExecution && (
        <ExecutionDetailsDrawer
          execution={selectedExecution}
          onClose={() => setSelectedExecution(null)}
          onReplay={handleReplay}
        />
      )}
    </div>
  );
};

export default Executions;
