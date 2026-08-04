import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, 'templates');

// ─── Register Handlebars Helpers ──────────────────────────────────────────────
Handlebars.registerHelper('index_plus_one', function () {
  return (this.__index || 0) + 1;
});

Handlebars.registerHelper('ifEqual', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('json', function (obj) {
  return JSON.stringify(obj, null, 2);
});

/**
 * PdfService — Production PDF generation engine using Puppeteer + Handlebars.
 *
 * Usage:
 *   const result = await PdfService.generatePdf({ template, content, variables, config });
 *
 * Returns:
 *   { buffer, base64, size, mimeType, fileName }
 */
export class PdfService {
  /**
   * Load and compile a Handlebars template file.
   */
  static _loadTemplate(templateName) {
    const templateFile = path.join(TEMPLATES_DIR, `${templateName}.hbs`);
    if (!fs.existsSync(templateFile)) {
      // Fall back to custom/blank
      const fallback = path.join(TEMPLATES_DIR, 'custom.hbs');
      return Handlebars.compile(fs.readFileSync(fallback, 'utf8'));
    }
    return Handlebars.compile(fs.readFileSync(templateFile, 'utf8'));
  }

  /**
   * Generate QR Code as Base64 PNG string.
   */
  static async _generateQRCode(data) {
    if (!data) return null;
    try {
      const qrBase64 = await QRCode.toDataURL(String(data), {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      // Strip the data:image/png;base64, prefix, return raw base64
      return qrBase64.replace(/^data:image\/png;base64,/, '');
    } catch {
      return null;
    }
  }

  /**
   * Build the full HTML string from a template + variables.
   */
  static async _buildHtml({ template, content, htmlContent, customHtml, bodyHtml, variables = {}, config = {} }) {
    // Extract raw user HTML content from any possible field name
    const rawUserHtml = htmlContent || customHtml || bodyHtml || content || config.htmlContent || config.customHtml || config.bodyHtml || config.content || '';

    // Selected template type calculation
    let templateName = (template || '').toLowerCase().replace(/\s+/g, '_');

    if (rawUserHtml && rawUserHtml.trim().length > 0) {
      if (!template || template === 'report' || template === 'blank' || template === 'custom' || template === 'custom_html') {
        templateName = 'custom_html';
      }
    } else if (!templateName) {
      templateName = 'report';
    }

    console.log(`[PdfService] Incoming request config/body:`, JSON.stringify({
      template: template || 'none',
      hasCustomHtml: Boolean(rawUserHtml),
      contentLength: rawUserHtml.length,
      variablesKeys: Object.keys(variables),
    }));
    console.log(`[PdfService] Selected template type: "${templateName}"`);

    // Generate QR Code if qrData is present
    let qrCodeBase64 = null;
    if (variables.qrData) {
      qrCodeBase64 = await this._generateQRCode(variables.qrData);
    }

    // Merge all context data — spread variables at root so {{varName}} works directly
    const context = {
      // Template defaults
      brandColor: config.brandColor || '#6366f1',
      companyName: config.companyName || '',
      companyAddress: config.companyAddress || '',
      companyPhone: config.companyPhone || '',
      companyEmail: config.companyEmail || '',
      companyWebsite: config.companyWebsite || '',
      logoUrl: config.logoUrl || '',
      watermark: config.watermark || '',
      watermarkOpacity: config.watermarkOpacity || 0.06,
      generatedDate: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      customCSS: config.customCSS || '',
      qrCodeBase64,
      ...variables,
    };

    // Pre-compile user HTML with Handlebars if custom HTML exists
    let compiledUserContent = '';
    if (rawUserHtml && rawUserHtml.trim().length > 0) {
      console.log(`[PdfService] HTML before compilation:\n${rawUserHtml}`);
      try {
        const contentTemplateFn = Handlebars.compile(rawUserHtml);
        compiledUserContent = contentTemplateFn(context);
        console.log(`[PdfService] HTML after compilation:\n${compiledUserContent}`);
      } catch (err) {
        console.warn(`[PdfService] Handlebars compilation error on custom HTML: ${err.message}`);
        compiledUserContent = rawUserHtml;
      }
    }

    // If template is custom or contains full HTML tags, compile directly or wrap in custom container
    if (templateName === 'custom_html' || templateName === 'custom') {
      const isFullDoc = compiledUserContent.includes('<html') || compiledUserContent.includes('<!DOCTYPE');
      if (isFullDoc) {
        return compiledUserContent;
      }
      context.content = compiledUserContent;
      const customTemplate = Handlebars.compile(fs.readFileSync(path.join(TEMPLATES_DIR, 'custom.hbs'), 'utf8'));
      return customTemplate(context);
    }

    // If blank template
    if (templateName === 'blank') {
      context.content = compiledUserContent;
      const blankTemplate = this._loadTemplate('blank');
      return blankTemplate(context);
    }

    // Built-in templates (invoice, certificate, report, receipt, offer_letter, salary_slip, resume)
    const builtInTemplate = this._loadTemplate(templateName);
    context.content = compiledUserContent;
    return builtInTemplate(context);
  }

  /**
   * Generate PDF from HTML using Puppeteer.
   */
  static async generatePdf({ template, content, htmlContent, customHtml, bodyHtml, variables = {}, config = {}, fileName }) {
    const startTime = Date.now();

    console.log(`[PdfService] Generating PDF — Template: "${template}", File: "${fileName}"`);

    // Build HTML
    const html = await this._buildHtml({ template, content, htmlContent, customHtml, bodyHtml, variables, config });
    console.log(`[PdfService] HTML passed into page.setContent():\n${html.substring(0, 300)}...`);

    // Page settings
    const pageSize = (config.pageSize || 'A4').toUpperCase();
    const landscape = (config.orientation || 'portrait').toLowerCase() === 'landscape';

    const margins = {
      top: config.marginTop || '15mm',
      right: config.marginRight || '15mm',
      bottom: config.marginBottom || '15mm',
      left: config.marginLeft || '15mm',
    };

    // Header HTML
    const headerHtml = config.headerHtml
      ? config.headerHtml
      : config.showHeader
        ? `<div style="font-size:10px;padding:0 15mm;width:100%;color:#94a3b8;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;padding-bottom:4px;"><span>${config.companyName || ''}</span><span>${config.headerText || ''}</span></div>`
        : '';

    // Footer HTML
    const footerHtml = config.footerHtml
      ? config.footerHtml
      : `<div style="font-size:9px;padding:0 15mm;width:100%;color:#94a3b8;display:flex;justify-content:space-between;"><span>${config.companyName || ''} — ${fileName || ''}</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span><span>${new Date().toLocaleDateString()}</span></div>`;

    let browser = null;
    let launchError = null;

    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
      ],
    };

    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    } else if (process.env.CHROME_PATH) {
      launchOptions.executablePath = process.env.CHROME_PATH;
    }

    try {
      browser = await puppeteer.launch(launchOptions);
    } catch (err) {
      console.error(`[PdfService] Primary Puppeteer browser launch failed: ${err.message}`);
      launchError = err;

      // Try system Chrome locations on Linux
      const fallbackPaths = [
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/usr/bin/chrome',
      ];

      for (const chromePath of fallbackPaths) {
        if (fs.existsSync(chromePath)) {
          try {
            console.log(`[PdfService] Retrying launch with system Chrome at: "${chromePath}"`);
            browser = await puppeteer.launch({ ...launchOptions, executablePath: chromePath });
            launchError = null;
            break;
          } catch (e) {
            console.warn(`[PdfService] Launch with ${chromePath} failed: ${e.message}`);
          }
        }
      }
    }

    if (!browser) {
      const errorMsg = `Could not launch Chrome/Puppeteer browser on server: ${launchError?.message || 'Unknown error'}. Verify browser installation.`;
      console.error(`[PdfService] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    try {
      const page = await browser.newPage();

      // Set content — use domcontentloaded & load to prevent networkidle0 timeouts on cloud servers
      try {
        await page.setContent(html, {
          waitUntil: ['domcontentloaded', 'load'],
          timeout: 15000,
        });
      } catch (navErr) {
        console.warn(`[PdfService] Page setContent timeout warning (proceeding with render): ${navErr.message}`);
      }

      // PDF options
      const pdfOptions = {
        format: pageSize,
        landscape,
        margin: margins,
        printBackground: true,
        displayHeaderFooter: !!(config.showHeader || config.showFooter || config.headerHtml || config.footerHtml),
        headerTemplate: headerHtml || '<span></span>',
        footerTemplate: footerHtml || '<span></span>',
      };

      // Password protection (Puppeteer does not natively support encryption,
      // but we build the hook here for future pdf-lib post-processing)
      if (config.userPassword || config.ownerPassword) {
        console.warn('[PdfService] Password protection requires pdf-lib post-processing (Phase 15.2).');
      }

      const pdfBuffer = await page.pdf(pdfOptions);
      const base64 = Buffer.from(pdfBuffer).toString('base64');
      const executionTime = Date.now() - startTime;

      console.log(`[PdfService] PDF generated — Size: ${pdfBuffer.length} bytes, Time: ${executionTime}ms`);

      return {
        buffer: pdfBuffer,
        base64,
        size: pdfBuffer.length,
        mimeType: 'application/pdf',
        fileName: fileName || 'document.pdf',
        executionTime,
        templateUsed: template,
        pageSize,
        landscape,
      };
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
    }
  }

  /**
   * Generate a live HTML preview (no Puppeteer — just compiled HTML string for browser iframe).
   */
  static async generatePreviewHtml({ template, content, variables = {}, config = {} }) {
    return this._buildHtml({ template, content, variables, config });
  }

  /**
   * List all available templates.
   */
  static listTemplates() {
    return [
      { id: 'blank', label: 'Blank Document', description: 'Empty page, full control', icon: 'File' },
      { id: 'invoice', label: 'Invoice', description: 'Professional invoice with line items', icon: 'FileText' },
      { id: 'certificate', label: 'Certificate', description: 'Certificate of achievement/completion', icon: 'Award' },
      { id: 'report', label: 'Report', description: 'Data report with KPI cards & tables', icon: 'BarChart2' },
      { id: 'receipt', label: 'Receipt', description: 'Payment receipt', icon: 'ShoppingCart' },
      { id: 'offer_letter', label: 'Offer Letter', description: 'Employment offer letter', icon: 'Briefcase' },
      { id: 'salary_slip', label: 'Salary Slip', description: 'Monthly salary slip with deductions', icon: 'DollarSign' },
      { id: 'resume', label: 'Resume', description: 'Professional resume/CV', icon: 'User' },
      { id: 'custom', label: 'Custom HTML', description: 'Full HTML+CSS control', icon: 'Code' },
    ];
  }
}
