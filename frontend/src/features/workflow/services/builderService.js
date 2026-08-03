import api from '../../../services/api';

export const builderService = {
  loadWorkflow: async (id) => {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },

  saveWorkflowDefinition: async (id, definition) => {
    const response = await api.put(`/workflows/${id}`, { definition });
    return response.data;
  },
};
