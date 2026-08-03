import api from '../../../services/api';

export const reliabilityService = {
  /**
   * Get reliability dashboard stats
   */
  getStats: async () => {
    const res = await api.get('/reliability/stats');
    return res.data;
  },

  /**
   * Get failed executions
   */
  getFailedExecutions: async ({ page = 1, limit = 15, search = '' } = {}) => {
    const res = await api.get('/reliability/failures', { params: { page, limit, search } });
    return res.data;
  },

  /**
   * Get Dead Letter Queue items
   */
  getDeadLetterQueue: async ({ page = 1, limit = 15, status = null } = {}) => {
    const res = await api.get('/reliability/dead-letter', { params: { page, limit, status } });
    return res.data;
  },

  /**
   * Replay a DLQ item
   */
  replayDeadLetterItem: async (id) => {
    const res = await api.post(`/reliability/dead-letter/${id}/replay`);
    return res.data;
  },

  /**
   * Delete a DLQ item
   */
  deleteDeadLetterItem: async (id) => {
    const res = await api.delete(`/reliability/dead-letter/${id}`);
    return res.data;
  },

  /**
   * Retry a failed execution
   */
  retryExecution: async (executionId) => {
    const res = await api.post(`/reliability/retry/${executionId}`);
    return res.data;
  },

  /**
   * Resume an execution from last successful node
   */
  resumeExecution: async (executionId) => {
    const res = await api.post(`/reliability/resume/${executionId}`);
    return res.data;
  },

  /**
   * Get recovery summary for an execution
   */
  getRecoverySummary: async (executionId) => {
    const res = await api.get(`/reliability/recovery/${executionId}`);
    return res.data;
  },
};
