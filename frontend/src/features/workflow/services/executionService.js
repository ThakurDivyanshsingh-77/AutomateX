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

  getExecutionById: async (executionId) => {
    const response = await api.get(`/executions/${executionId}`);
    return response.data;
  },
};
