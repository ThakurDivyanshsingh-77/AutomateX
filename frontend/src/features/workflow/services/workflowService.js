import api from '../../../services/api';

export const workflowService = {
  getWorkflows: async (params = {}) => {
    const response = await api.get('/workflows', { params });
    return response.data;
  },

  getWorkflowById: async (id) => {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },

  createWorkflow: async (data) => {
    const response = await api.post('/workflows', data);
    return response.data;
  },

  updateWorkflow: async (id, data) => {
    const response = await api.put(`/workflows/${id}`, data);
    return response.data;
  },

  deleteWorkflow: async (id) => {
    const response = await api.delete(`/workflows/${id}`);
    return response.data;
  },

  duplicateWorkflow: async (id) => {
    const response = await api.post(`/workflows/${id}/duplicate`);
    return response.data;
  },

  publishWorkflow: async (id) => {
    const response = await api.patch(`/workflows/${id}/publish`);
    return response.data;
  },

  archiveWorkflow: async (id) => {
    const response = await api.patch(`/workflows/${id}/archive`);
    return response.data;
  },
};
