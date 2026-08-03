import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { workflowService } from '../features/workflow/services/workflowService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Zap, ShieldCheck, LogOut, Plus, GitFork } from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [totalWorkflows, setTotalWorkflows] = useState(0);

  useEffect(() => {
    workflowService.getWorkflows({ limit: 1 }).then((res) => {
      setTotalWorkflows(res.total || 0);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none font-sans">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Phase 2 Active
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Workflow Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome, {user?.name || 'User'} 👋
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Logged in as <strong className="text-slate-200">{user?.email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="text-slate-300 hover:text-rose-400"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/workflows/create')}
          >
            <Plus className="w-4 h-4" /> Create Workflow
          </Button>
        </div>
      </Card>

      {/* Account Info Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Workflows Count</span>
            <GitFork className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white">{totalWorkflows} Workflows</div>
          <p className="text-[11px] text-slate-500">Managed in Dashboard</p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Session Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">Authenticated</div>
          <p className="text-[11px] text-slate-500">JWT Token Verified</p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Next Module</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-slate-300">Phase 3</div>
          <p className="text-[11px] text-slate-500">React Flow Canvas Builder</p>
        </Card>
      </div>

      {/* Quick Action / EmptyState */}
      {totalWorkflows === 0 ? (
        <EmptyState
          icon={GitFork}
          title="No workflows created yet"
          description="Create your first automation workflow project to manage draft settings, tags, and execution status."
          actionButton={
            <Button variant="primary" size="sm" onClick={() => navigate('/workflows/create')}>
              <Plus className="w-4 h-4" /> Create First Workflow
            </Button>
          }
        />
      ) : (
        <Card className="p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Manage Automation Workflows</h3>
            <p className="text-xs text-slate-400">View, search, edit, duplicate, publish, and delete your workflows.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/workflows')}>
            Go to Workflows Dashboard
          </Button>
        </Card>
      )}
    </div>
  );
};
