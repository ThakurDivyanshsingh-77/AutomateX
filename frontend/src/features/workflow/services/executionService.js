import api from '../../../services/api';

export const executionService = {
  runWorkflow: async (workflowId) => {
    const response = await api.post(`/workflows/${workflowId}/run`);
    return response.data;
  },

  getWorkflowExecutions: async (workflowId) => {
    const response = await api.get(`/workflows/${workflowId}/executions`);
    return response.data;
  },

  getExecutions: async (params = {}) => {
    const response = await api.get('/executions', { params });
    return response.data;
  },

  getExecutionStats: async () => {
    const response = await api.get('/executions/stats');
    return response.data;
  },

  getExecutionById: async (executionId) => {
    const response = await api.get(`/executions/${executionId}`);
    return response.data;
  },

  replayExecution: async (executionId) => {
    const response = await api.post(`/executions/${executionId}/replay`);
    return response.data;
  },

  deleteExecution: async (executionId) => {
    const response = await api.delete(`/executions/${executionId}`);
    return response.data;
  },
};
