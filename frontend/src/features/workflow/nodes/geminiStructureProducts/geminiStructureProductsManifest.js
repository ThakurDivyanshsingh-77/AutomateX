import { Sparkles } from 'lucide-react';

export const geminiStructureProductsManifest = {
  type: 'geminiStructureProducts',
  category: 'AI / DOCUMENT PROCESSING',
  label: 'Gemini → Structure Products',
  subtitle: 'Convert extracted document text into structured product records',
  description: 'Convert extracted document content into structured product records.',
  icon: Sparkles,
  color: 'purple',
  badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  hasInputHandle: true,
  hasOutputHandle: true,
  searchKeywords: [
    'gemini',
    'structure',
    'products',
    'product',
    'parsing',
    'ai',
    'document',
    'schema',
    'extract',
    'multi',
  ],
  defaultData: {
    label: 'Gemini → Structure Products',
    config: {
      credentialId: '',
      documentText: '{{steps["Document → Extract Content"].content.text}}',
      model: 'gemini-1.5-flash',
      temperature: 0.1,
    },
  },
  defaultConfig: {
    credentialId: '',
    documentText: '{{steps["Document → Extract Content"].content.text}}',
    model: 'gemini-1.5-flash',
    temperature: 0.1,
  },
  validate: (config) => {
    const hasDoc = Boolean(config?.documentText || config?.text);
    if (!hasDoc) {
      return {
        isValid: false,
        errors: { documentText: 'Document text source is required.' },
      };
    }
    return {
      isValid: true,
      errors: {},
    };
  },
};
