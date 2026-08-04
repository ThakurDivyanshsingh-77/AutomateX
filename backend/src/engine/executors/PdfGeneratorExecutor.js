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

    // 1. Resolve variables in filename
    const resolvedFileName = this._resolveVariables(
      config.fileName || 'document_{{now}}.pdf',
      context
    );

    // 2. Resolve variables in content / HTML
    const resolvedContent = this._resolveVariables(
      config.content || config.htmlContent || '',
      context
    );

    // 3. Build variables map from context (all upstream node outputs)
    const variables = this._buildVariablesMap(context, config);

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
    };

    // 5. Generate PDF
    const result = await PdfService.generatePdf({
      template: config.template || 'blank',
      content: resolvedContent,
      variables,
      config: pdfConfig,
      fileName: resolvedFileName,
    });

    // 6. Determine output mode
    const outputMode = (config.outputMode || 'base64').toLowerCase();

    const outputs = {
      success: true,
      fileName: resolvedFileName,
      mimeType: result.mimeType,
      size: result.size,
      executionTime: result.executionTime,
      templateUsed: result.templateUsed,
    };

    if (outputMode === 'base64' || outputMode === 'all') {
      outputs.base64 = result.base64;
    }

    // For Gmail attachment compatibility — produce attachment object
    outputs.attachment = {
      filename: resolvedFileName,
      content: result.base64,
      encoding: 'base64',
      contentType: 'application/pdf',
    };

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

    // Flatten context outputs from each node
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

    // Merge explicit template variables from config
    if (config.templateVariables && typeof config.templateVariables === 'object') {
      Object.assign(vars, config.templateVariables);
    }

    // Common time variables
    vars.now = new Date().toLocaleDateString('en-IN');
    vars.timestamp = Date.now();
    vars.generatedDate = new Date().toLocaleString('en-IN');

    return vars;
  }
}
