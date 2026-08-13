import { UploadCloud } from 'lucide-react';

export const fileUploadManifest = {
  type: 'fileUpload',
  category: 'INPUT',
  label: 'File → Upload Document',
  subtitle: 'Upload a document for workflow processing',
  description: 'Upload a document that will be passed to the next workflow step.',
  icon: UploadCloud,
  color: 'blue',
  badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  hasInputHandle: true,
  hasOutputHandle: true,
  defaultConfig: {
    fileId: null,
    file: null,
  },
  validate: (config) => {
    const fileId = config?.fileId || config?.file?.id;
    if (!fileId) {
      return {
        isValid: false,
        errors: { file: 'No document file selected.' },
      };
    }
    return {
      isValid: true,
      errors: {},
    };
  },
};
