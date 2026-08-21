import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { workflowService } from '../services/workflowService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import toast from 'react-hot-toast';
import { GitFork, ArrowLeft, Save, X } from 'lucide-react';

export const CreateWorkflow = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      tags: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const parsedTags = data.tags
        ? data.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const res = await workflowService.createWorkflow({
        name: data.name,
        description: data.description,
        tags: parsedTags,
      });

      toast.success(res.message || 'Workflow draft created successfully');
      navigate('/workflows');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create workflow';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 select-none font-sans text-slate-900">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/workflows')}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workflows
        </button>
      </div>

      <Card className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-brand-600">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Create New Workflow</h1>
            <p className="text-xs text-slate-500">Setup your workflow details and initial draft settings</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Workflow Name"
            placeholder="e.g. Daily Sales Report Automation"
            error={errors.name?.message}
            {...register('name', {
              required: 'Workflow name is required',
              minLength: {
                value: 3,
                message: 'Name must be at least 3 characters',
              },
              maxLength: {
                value: 100,
                message: 'Name cannot exceed 100 characters',
              },
            })}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Description (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="Describe what this workflow automates..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all shadow-sm"
              {...register('description', {
                maxLength: {
                  value: 500,
                  message: 'Description cannot exceed 500 characters',
                },
              })}
            />
            {errors.description && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.description.message}</p>
            )}
          </div>

          <Input
            label="Tags (Comma Separated)"
            placeholder="e.g. Email, Marketing, Sales"
            {...register('tags')}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/workflows')}
            >
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              <Save className="w-4 h-4" /> Save Draft
            </Button>
          </div>
        </form>
      </Card>
    </div>

  );
};
