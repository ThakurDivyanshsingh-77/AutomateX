import { PackagePlus } from 'lucide-react';

export const websiteCreateProductManifest = {
  type: 'websiteCreateProduct',
  category: 'INTEGRATIONS / WEBSITE',
  label: 'Website → Create Product',
  subtitle: 'Create a product on the connected website',
  description: 'Create a product on the connected website using field mapping, duplicate protection, and connectionId.',
  icon: PackagePlus,
  color: 'emerald',
  badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  hasInputHandle: true,
  hasOutputHandle: true,
  searchKeywords: [
    'website',
    'create',
    'product',
    'products',
    'publish',
    'rest',
    'api',
    'mapping',
    'integration',
    'shop',
    'store',
  ],
  defaultData: {
    label: 'Website → Create Product',
    config: {
      connectionId: '{{steps["Website → Connect"].connectionId}}',
      product: '{{steps["For Each Product"].currentItem}}',
      endpoint: '/api/products',
      method: 'POST',
      dryRun: false,
      duplicateStrategy: 'skip',
      rateLimitMs: 1000,
      fieldMapping: {
        name: 'product_name',
        casNumber: 'cas_number',
        urlSlug: 'slug',
        titleTag: 'seo_title',
        metaDescription: 'seo_description',
        h1: 'h1',
        description: 'description',
        faqs: 'faqs',
        schemaMarkup: 'schema_markup',
      },
    },
  },
  defaultConfig: {
    connectionId: '{{steps["Website → Connect"].connectionId}}',
    product: '{{steps["For Each Product"].currentItem}}',
    endpoint: '/api/products',
    method: 'POST',
    dryRun: false,
    duplicateStrategy: 'skip',
    rateLimitMs: 1000,
    fieldMapping: {
      name: 'product_name',
      casNumber: 'cas_number',
      urlSlug: 'slug',
      titleTag: 'seo_title',
      metaDescription: 'seo_description',
      h1: 'h1',
      description: 'description',
      faqs: 'faqs',
      schemaMarkup: 'schema_markup',
    },
  },
  validate: (config) => {
    const hasConn = Boolean(config?.connectionId || config?.websiteUrl);
    const hasProd = Boolean(config?.product || config?.products);
    if (!hasConn) {
      return {
        isValid: false,
        errors: { connectionId: 'Website connection reference is required.' },
      };
    }
    if (!hasProd) {
      return {
        isValid: false,
        errors: { product: 'Product data reference is required.' },
      };
    }
    return {
      isValid: true,
      errors: {},
    };
  },
};
