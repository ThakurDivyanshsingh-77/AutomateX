import { FileText } from 'lucide-react';

export const documentExtractManifest = {
  type: 'documentExtractContent',
  category: 'DOCUMENT / DATA',
  label: 'Document → Extract Content',
  subtitle: 'Extract text, tables, and document structure',
  description: 'Extract text, tables, and useful document structure from an uploaded document.',
  icon: FileText,
  color: 'indigo',
  badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  hasInputHandle: true,
  hasOutputHandle: true,
  defaultConfig: {
    fileId: '{{steps["File → Upload Document"].file.id}}',
    extractionMode: 'full',
  },
  validate: (config) => {
    const fileId = config?.fileId;
    if (!fileId) {
      return {
        isValid: false,
        errors: { fileId: 'Document file ID or variable reference is required.' },
      };
    }
    return {
      isValid: true,
      errors: {},
    };
  },
};
