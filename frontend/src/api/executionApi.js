import axiosClient from './axiosClient';

export const executionApi = {
  triggerWorkflow: async (workflowId, payload = {}) => {
    const res = await axiosClient.post(`/executions/trigger/${workflowId}`, { payload });
    return res.data;
  },
  testRun: async (workflowId, nodes, edges, payload = {}) => {
    const res = await axiosClient.post(`/executions/trigger/${workflowId}`, { nodes, edges, payload });
    return res.data;
  },
  getExecutionLogs: async (workflowId = null, limit = 20) => {
    const res = await axiosClient.get('/executions', {
      params: { workflowId, limit }
    });
    return res.data;
  },
  getExecutionLogById: async (id) => {
    const res = await axiosClient.get(`/executions/${id}`);
    return res.data;
  },
};
