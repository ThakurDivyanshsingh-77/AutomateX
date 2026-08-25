import api from '../../../services/api';

export const aiService = {
  /**
   * Generate a workflow graph from a natural language prompt
   */
  generateWorkflow: async (prompt, credentials = {}) => {
    const res = await api.post('/ai/generate', { prompt, credentials });
    return res.data;
  },

  /**
   * Explain a workflow graph definition in plain English
   */
  explainWorkflow: async (definition) => {
    const res = await api.post('/ai/explain', { definition });
    return res.data;
  },

  /**
   * Optimize a workflow graph definition
   */
  optimizeWorkflow: async (definition) => {
    const res = await api.post('/ai/optimize', { definition });
    return res.data;
  },

  /**
   * Auto-fix an invalid workflow graph
   */
  fixWorkflow: async (definition) => {
    const res = await api.post('/ai/fix', { definition });
    return res.data;
  },
};
