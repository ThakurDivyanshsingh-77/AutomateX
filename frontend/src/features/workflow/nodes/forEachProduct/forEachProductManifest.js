import { Repeat } from 'lucide-react';

export const forEachProductManifest = {
  type: 'forEachProduct',
  category: 'CONTROL / FLOW',
  label: 'For Each Product',
  subtitle: 'Iterate products one by one sequentially',
  description: 'Process an array of structured products one item at a time.',
  icon: Repeat,
  color: 'amber',
  badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  hasInputHandle: true,
  hasOutputHandle: true,
  searchKeywords: [
    'for each',
    'foreach',
    'loop',
    'product',
    'products',
    'iterate',
    'batch',
    'array',
    'control',
    'flow',
  ],
  defaultData: {
    label: 'For Each Product',
    config: {
      products: '{{steps["Gemini → Structure Products"].products}}',
      itemVariable: 'currentItem',
      indexVariable: 'currentIndex',
    },
  },
  defaultConfig: {
    products: '{{steps["Gemini → Structure Products"].products}}',
    itemVariable: 'currentItem',
    indexVariable: 'currentIndex',
  },
  validate: (config) => {
    const hasCol = Boolean(config?.products || config?.collection || config?.items);
    if (!hasCol) {
      return {
        isValid: false,
        errors: { products: 'Products array expression is required.' },
      };
    }
    return {
      isValid: true,
      errors: {},
    };
  },
};
