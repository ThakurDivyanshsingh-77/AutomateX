import { FileOutput } from 'lucide-react';

export const pdfGeneratorManifest = {
  type: 'pdfGenerator',
  label: 'PDF Generator',
  category: 'Output',
  icon: FileOutput,
  color: '#8b5cf6',
  badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  description: 'Generate professional PDFs from workflow data. Supports invoices, certificates, reports, receipts, and custom HTML.',
  inputs: 1,
  outputs: 1,
  defaultData: {
    label: 'PDF Generator',
    config: {
      template: 'blank',
      fileName: 'document_{{now}}.pdf',
      pageSize: 'A4',
      orientation: 'portrait',
      outputMode: 'base64',
      content: '<h1>Hello {{trigger.body.name}}</h1>\n<p>Generated on {{now}}</p>',
      brandColor: '#6366f1',
      companyName: '',
      showFooter: true,
      showHeader: false,
      watermark: '',
      marginTop: '15mm',
      marginRight: '15mm',
      marginBottom: '20mm',
      marginLeft: '15mm',
    },
  },
  configSchema: [],
  validate: (config) => {
    const errors = {};
    if (!config.fileName) errors.fileName = 'Filename is required.';
    if (!config.template) errors.template = 'Template is required.';
    if (!config.content && config.template === 'blank') errors.content = 'Content is required for blank template.';
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};
