import api from './api';

export const fileService = {
  /**
   * Upload a document file to backend with upload progress tracking
   */
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  /**
   * Get metadata for an uploaded file
   */
  getFileMetadata: async (fileId) => {
    const response = await api.get(`/files/${fileId}`);
    return response.data;
  },

  /**
   * Delete an uploaded file
   */
  deleteFile: async (fileId) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },
};
