import api from '../../../services/api';

export const templateService = {
  getTemplates: async (category = 'all') => {
    const response = await api.get('/templates', { params: { category } });
    return response.data;
  },

  instantiateTemplate: async (id) => {
    const response = await api.post(`/templates/${id}/instantiate`);
    return response.data;
  },
};
