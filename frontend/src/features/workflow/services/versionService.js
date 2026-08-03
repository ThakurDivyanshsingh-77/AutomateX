import api from '../../../services/api';

export const versionService = {
  /**
   * Get all versions for a workflow
   */
  getVersions: async (workflowId) => {
    const res = await api.get(`/workflows/${workflowId}/versions`);
    return res.data;
  },

  /**
   * Get a single version by semver tag (e.g. "v1.2.0")
   */
  getVersion: async (workflowId, version) => {
    const res = await api.get(`/workflows/${workflowId}/versions/${encodeURIComponent(version)}`);
    return res.data;
  },

  /**
   * Save / upsert the current draft
   */
  saveDraft: async (workflowId, definition) => {
    const res = await api.post(`/workflows/${workflowId}/versions/draft`, { definition });
    return res.data;
  },

  /**
   * Publish a new version
   */
  publishVersion: async (workflowId, { definition, changeSummary = [], bump = 'minor', title = '', description = '' } = {}) => {
    const res = await api.post(`/workflows/${workflowId}/publish`, {
      definition,
      changeSummary,
      bump,
      title,
      description,
    });
    return res.data;
  },

  /**
   * Restore the workflow to a specific version
   */
  restoreVersion: async (workflowId, version) => {
    const res = await api.post(`/workflows/${workflowId}/restore/${encodeURIComponent(version)}`);
    return res.data;
  },

  /**
   * Compare two versions
   */
  compareVersions: async (workflowId, versionA, versionB) => {
    const res = await api.post(`/workflows/${workflowId}/compare`, { versionA, versionB });
    return res.data;
  },

  /**
   * Delete the current draft
   */
  deleteDraft: async (workflowId) => {
    const res = await api.delete(`/workflows/${workflowId}/draft`);
    return res.data;
  },
};
