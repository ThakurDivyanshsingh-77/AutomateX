import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workflowApi } from '../api/workflowApi';
import { executionApi } from '../api/executionApi';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Zap,
  Play,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  Clock,
  LogOut,
  Layers,
  Activity,
  UserCheck
} from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, loginAsDemo } = useAuth();

  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [executingWfId, setExecutingWfId] = useState(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const data = await workflowApi.getAllWorkflows();
      setWorkflows(data || []);
    } catch (err) {
      console.error('Error fetching workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      const newWf = await workflowApi.createWorkflow({
        name: 'Untitled Automation Workflow',
        description: 'Visual workflow created on ' + new Date().toLocaleDateString(),
      });
      navigate(`/builder/${newWf._id}`);
    } catch (err) {
      console.error('Error creating workflow:', err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await workflowApi.deleteWorkflow(id);
      setWorkflows((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      console.error('Error deleting workflow:', err);
    }
  };

  const handleTrigger = async (id, e) => {
    e.stopPropagation();
    setExecutingWfId(id);
    try {
      await executionApi.triggerWorkflow(id);
      alert('Workflow execution triggered successfully!');
    } catch (err) {
      alert('Execution failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setExecutingWfId(null);
    }
  };

  const filtered = workflows.filter(
    (w) =>
      w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Zap className="w-5 h-5 fill-brand-400" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              AutomateX <span className="text-[10px] font-mono font-normal bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full border border-brand-500/30">v1.0 SaaS</span>
            </h1>
            <p className="text-[11px] text-slate-400">Visual Workflow Automation Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/executions')}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Activity className="w-4 h-4 text-emerald-400" /> Execution Logs
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300 font-semibold text-xs">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-medium text-slate-300">{user?.name || 'Engineer'}</span>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Banner Section */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="space-y-2 max-w-xl z-10">
            <span className="text-xs font-semibold text-brand-400 tracking-wider uppercase">
              Production Workflow Engine
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Design, Automate & Integrate Visual Workflows
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect HTTP APIs, JavaScript code transformers, logic conditions, and webhooks with DAG topological execution order.
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="z-10 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" /> Create New Workflow
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search workflows by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total Workflows: <strong className="text-white">{filtered.length}</strong>
          </span>
        </div>

        {/* Workflows List Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-slate-900/50 border border-slate-800/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-2xl space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No workflows found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Get started by creating your first visual automation workflow using React Flow canvas.
            </p>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Workflow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((wf) => (
              <div
                key={wf._id}
                onClick={() => navigate(`/builder/${wf._id}`)}
                className="group bg-slate-900 border border-slate-800 hover:border-brand-500/50 rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-lg hover:shadow-brand-500/5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60 text-brand-400 group-hover:scale-105 transition-transform">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
                      {wf.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {wf.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono text-[10px]">
                    {wf.nodes?.length || 3} Nodes
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleTrigger(wf._id, e)}
                      disabled={executingWfId === wf._id}
                      title="Run Workflow"
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/builder/${wf._id}`);
                      }}
                      title="Edit Builder"
                      className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(wf._id, e)}
                      title="Delete"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
