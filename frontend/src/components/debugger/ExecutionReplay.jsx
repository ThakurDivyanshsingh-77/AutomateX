import React, { useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const ExecutionReplay = ({ executionId, onReplaySuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleReplay = async () => {
    if (!executionId) return;
    setLoading(true);

    try {
      const res = await api.post(`/executions/${executionId}/replay`);
      toast.success('Workflow execution replayed successfully!');
      if (onReplaySuccess) {
        onReplaySuccess(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Replay failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleReplay}
      disabled={loading || !executionId}
      className="p-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-md shadow-indigo-600/20"
      title="Replay workflow execution with same input payload"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
      <span>{loading ? 'Replaying...' : 'Replay Execution'}</span>
    </button>
  );
};
