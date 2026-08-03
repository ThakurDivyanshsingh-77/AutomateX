import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workflowService } from '../services/workflowService';
import { WorkflowCard } from '../components/WorkflowCard';
import { WorkflowFilters } from '../components/WorkflowFilters';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loader } from '../../../components/ui/Loader';
import toast from 'react-hot-toast';
import { Plus, GitFork, RefreshCw } from 'lucide-react';

export const Workflows = () => {
  const navigate = useNavigate();

  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchWorkflows();
  }, [search, status, sort, page]);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await workflowService.getWorkflows({
        search,
        status,
        sort,
        page,
        limit: 9,
      });
      setWorkflows(res.data || res.workflows || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await workflowService.duplicateWorkflow(id);
      toast.success(res.message || 'Workflow duplicated');
      fetchWorkflows();
    } catch (err) {
      toast.error('Failed to duplicate workflow');
    }
  };

  const handlePublish = async (id) => {
    try {
      const res = await workflowService.publishWorkflow(id);
      toast.success(res.message || 'Status updated');
      fetchWorkflows();
    } catch (err) {
      toast.error('Failed to update workflow status');
    }
  };

  const handleArchive = async (id) => {
    try {
      const res = await workflowService.archiveWorkflow(id);
      toast.success(res.message || 'Workflow archived');
      fetchWorkflows();
    } catch (err) {
      toast.error('Failed to archive workflow');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;
    try {
      const res = await workflowService.deleteWorkflow(id);
      toast.success(res.message || 'Workflow deleted');
      fetchWorkflows();
    } catch (err) {
      toast.error('Failed to delete workflow');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Workflow Management System
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, manage, duplicate, publish, and structure your automation projects.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/workflows/create')}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Create Workflow
        </Button>
      </div>

      {/* Filters Bar */}
      <WorkflowFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        sort={sort}
        onSortChange={(val) => {
          setSort(val);
          setPage(1);
        }}
        page={page}
        pages={pages}
        total={total}
        onPageChange={(p) => setPage(p)}
      />

      {/* Workflows Grid / Loading / Empty */}
      {loading ? (
        <Loader text="Loading workflows..." />
      ) : workflows.length === 0 ? (
        <EmptyState
          icon={GitFork}
          title="No workflows found"
          description={
            search || status !== 'all'
              ? 'No workflows matched your search or status criteria.'
              : 'You have not created any automation workflows yet.'
          }
          actionButton={
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/workflows/create')}
            >
              <Plus className="w-4 h-4" /> Create First Workflow
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workflows.map((wf) => (
            <WorkflowCard
              key={wf._id}
              workflow={wf}
              onDuplicate={handleDuplicate}
              onPublish={handlePublish}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
