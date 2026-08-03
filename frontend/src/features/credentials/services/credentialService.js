import api from '../../../services/api';

export const credentialService = {
  getCredentials: async () => {
    const response = await api.get('/credentials');
    return response.data;
  },

  createCredential: async (data) => {
    const response = await api.post('/credentials', data);
    return response.data;
  },

  deleteCredential: async (id) => {
    const response = await api.delete(`/credentials/${id}`);
    return response.data;
  },
};
