import axiosClient from './axiosClient';

export const workflowApi = {
  getAllWorkflows: async () => {
    const res = await axiosClient.get('/workflows');
    return res.data;
  },
  getWorkflowById: async (id) => {
    const res = await axiosClient.get(`/workflows/${id}`);
    return res.data;
  },
  createWorkflow: async (data) => {
    const res = await axiosClient.post('/workflows', data);
    return res.data;
  },
  updateWorkflow: async (id, data) => {
    const res = await axiosClient.put(`/workflows/${id}`, data);
    return res.data;
  },
  deleteWorkflow: async (id) => {
    const res = await axiosClient.delete(`/workflows/${id}`);
    return res.data;
  },
};
