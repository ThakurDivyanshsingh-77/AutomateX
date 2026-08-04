import { BaseExecutor } from './BaseExecutor.js';
import { PdfService } from '../pdf/PdfService.js';

/**
 * PdfGeneratorExecutor — Workflow execution handler for the PDF Generator node.
 *
 * Resolves {{variables}} in filename + content, calls PdfService.generatePdf(),
 * and returns the PDF as base64 with full execution metadata.
 */
export class PdfGeneratorExecutor extends BaseExecutor {
  async execute(node, context) {
    const startTime = Date.now();
    const config = node.config || node.data?.config || {};

    console.log(`[PdfGeneratorExecutor] Starting PDF generation for node "${node.id}"`);
    console.log(`[PdfGeneratorExecutor] Template: "${config.template}", FileName: "${config.fileName}"`);

    // 1. Build runtime variables map from context
    const variables = this._buildVariablesMap(context, config);

    // 2. Resolve filename using variables
    const rawFileName = config.fileName || 'document_{{now}}.pdf';
    const resolvedFileName = this._resolveVariables(rawFileName, variables);

    // 3. Extract user template content from any possible field name
    const rawContent = config.htmlContent || config.customHtml || config.bodyHtml || config.content || '';

    // 4. Build branding/layout config
    const pdfConfig = {
      pageSize: config.pageSize || 'A4',
      orientation: config.orientation || 'portrait',
      brandColor: config.brandColor || '#6366f1',
      companyName: config.companyName || '',
      companyAddress: config.companyAddress || '',
      companyPhone: config.companyPhone || '',
      companyEmail: config.companyEmail || '',
      companyWebsite: config.companyWebsite || '',
      logoUrl: config.logoUrl || '',
      watermark: config.watermark || '',
      watermarkOpacity: config.watermarkOpacity || 0.06,
      showHeader: Boolean(config.showHeader),
      showFooter: Boolean(config.showFooter !== false),
      headerHtml: config.headerHtml || '',
      footerHtml: config.footerHtml || '',
      headerText: config.headerText || '',
      marginTop: config.marginTop || '15mm',
      marginRight: config.marginRight || '15mm',
      marginBottom: config.marginBottom || '20mm',
      marginLeft: config.marginLeft || '15mm',
      customCSS: config.customCSS || '',
      htmlContent: config.htmlContent,
      customHtml: config.customHtml,
      bodyHtml: config.bodyHtml,
      content: config.content,
    };

    // 5. Generate PDF with Handlebars compiled content
    const result = await PdfService.generatePdf({
      template: config.template,
      content: rawContent,
      htmlContent: config.htmlContent,
      customHtml: config.customHtml,
      bodyHtml: config.bodyHtml,
      variables,
      config: pdfConfig,
      fileName: resolvedFileName,
    });

    // 6. Build complete execution output payload
    const downloadUrl = `data:application/pdf;base64,${result.base64}`;

    const attachment = {
      filename: resolvedFileName,
      content: result.base64,
      encoding: 'base64',
      contentType: 'application/pdf',
      size: result.size,
    };

    const outputs = {
      success: true,
      fileName: resolvedFileName,
      mimeType: result.mimeType || 'application/pdf',
      size: result.size,
      base64: result.base64,
      attachment,
      downloadUrl,
      executionTime: result.executionTime,
      templateUsed: result.templateUsed,
    };

    const outputMode = (config.outputMode || 'base64').toLowerCase();

    if (outputMode === 'binary') {
      outputs.binary = result.buffer;
    } else if (outputMode === 'storage' || outputMode === 'save_storage') {
      outputs.storagePath = `test_pdfs/${resolvedFileName}`;
    }

    console.log(`[PdfGeneratorExecutor] PDF generated: ${resolvedFileName} (${result.size} bytes) in ${result.executionTime}ms`);

    return {
      status: 'success',
      output: outputs,
    };
  }

  /**
   * Resolve {{variable}} placeholders in a string from context.
   */
  _resolveVariables(str, context) {
    if (!str || typeof str !== 'string') return str;
    return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const trimmed = path.trim();
      if (trimmed === 'now') return new Date().toLocaleDateString('en-IN');
      if (trimmed === 'timestamp') return Date.now().toString();
      if (trimmed === 'workflow.id') return context.workflowId || '';
      if (trimmed === 'execution.id') return context.executionId || '';

      // Traverse dot-notation path in context
      const parts = trimmed.split('.');
      let current = context;
      for (const part of parts) {
        if (current == null) return match;
        current = current[part];
      }
      return current !== undefined && current !== null ? String(current) : match;
    });
  }

  /**
   * Build a flat + nested variables map from the workflow execution context.
   */
  _buildVariablesMap(context, config) {
    const vars = {};

    // 1. Flatten context outputs from each node
    if (context && typeof context === 'object') {
      Object.entries(context).forEach(([key, value]) => {
        if (value && typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subVal]) => {
            vars[`${key}.${subKey}`] = subVal;
          });
        }
        vars[key] = value;
      });
    }

    // 2. Standardized runtime variables: now, gmail, mongodb, http, workflow, vars
    vars.now = new Date().toLocaleDateString('en-IN');
    vars.timestamp = Date.now();
    vars.generatedDate = new Date().toLocaleString('en-IN');

    vars.gmail = context?.gmail || context?.readEmail || context?.searchEmails || vars.gmail || {};
    vars.mongodb = context?.mongodb || context?.mongoFind || context?.mongoInsertOne || vars.mongodb || {};
    vars.http = context?.http || context?.httpRequest || vars.http || {};
    vars.workflow = {
      id: context?.workflowId || 'wf_demo',
      executionId: context?.executionId || '',
    };
    vars.vars = context || {};

    // Merge explicit template variables from config
    if (config.templateVariables && typeof config.templateVariables === 'object') {
      Object.assign(vars, config.templateVariables);
    }

    return vars;
  }
}
