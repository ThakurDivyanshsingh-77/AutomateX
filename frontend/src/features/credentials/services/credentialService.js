import api from '../../../services/api';

export const credentialService = {
  getCredentials: async () => {
    const response = await api.get('/credentials');
    return response.data;
  },

  getCredentialsByService: async (serviceType = 'mongodb') => {
    const response = await api.get('/credentials');
    const allCreds = response.data?.data || response.data || [];
    if (!Array.isArray(allCreds)) return [];

    const target = (serviceType || '').toLowerCase();
    return allCreds.filter((cred) => {
      const s = (cred.service || cred.type || cred.serviceName || '').toLowerCase();
      if (!target) return true;
      if (target === 'mongodb' || target === 'mongo') return s.includes('mongo');
      return s === target || s.includes(target);
    });
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
