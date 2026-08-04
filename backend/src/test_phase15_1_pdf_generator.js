import { PdfService } from './engine/pdf/PdfService.js';
import { PdfGeneratorExecutor } from './engine/executors/PdfGeneratorExecutor.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runTests() {
  console.log('=== Phase 15.1 PDF Generator Node — Automated Test Suite ===\n');

  let passed = 0;
  let total = 0;

  function assert(name, condition, detail = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${name}`);
    } else {
      console.error(`❌ [FAIL] ${name}${detail ? ` — ${detail}` : ''}`);
    }
  }

  // ─── Test 1: PdfService.listTemplates() ───────────────────────────────────
  console.log('Test 1: Template Registry...');
  const templates = PdfService.listTemplates();
  assert('listTemplates returns array', Array.isArray(templates));
  assert('listTemplates contains 9 entries', templates.length === 9);
  assert('Invoice template exists', templates.some((t) => t.id === 'invoice'));
  assert('Certificate template exists', templates.some((t) => t.id === 'certificate'));
  assert('Custom template exists', templates.some((t) => t.id === 'custom'));

  // Test 2: PdfService.generatePreviewHtml() — blank template passes content through
  console.log('\nTest 2: Preview HTML Generation (no Puppeteer)...');
  const previewHtml = await PdfService.generatePreviewHtml({
    template: 'blank',
    content: '<h1>Hello Divyansh</h1><p>Generated: 04 Aug 2026</p>',
    variables: { name: 'Divyansh', now: '04 Aug 2026' },
    config: { brandColor: '#6366f1' },
  });
  assert('Preview HTML is a non-empty string', typeof previewHtml === 'string' && previewHtml.length > 0);
  assert('Preview HTML contains DOCTYPE', previewHtml.includes('<!DOCTYPE html>'));
  assert('Preview HTML contains content from blank template', previewHtml.includes('Hello Divyansh'));

  // ─── Test 2.1: Handlebars Compilation Engine ──────────────────────────────
  console.log('\nTest 2.1: Handlebars Compilation Engine ({{now}}, {{gmail.count}}, {{#each gmail.messages}}, missing vars)...');
  const handlebarsContent = `
    <h1>Date: {{now}}</h1>
    <p>Unread Count: {{gmail.count}}</p>
    <ul>
      {{#each gmail.messages}}
        <li>Subject: {{subject}} | From: {{from}}</li>
      {{/each}}
    </ul>
    <p>Missing Var: [{{nonExistentVar}}]</p>
  `;
  const handlebarsPreview = await PdfService.generatePreviewHtml({
    template: 'blank',
    content: handlebarsContent,
    variables: {
      now: '04/08/2026',
      gmail: {
        count: 2,
        messages: [
          { subject: 'Order Confirmation #1001', from: 'sales@shop.com' },
          { subject: 'Invoice #1002', from: 'billing@shop.com' },
        ],
      },
    },
    config: {},
  });

  assert('Handlebars preview compiles {{now}}', handlebarsPreview.includes('Date: 04/08/2026'));
  assert('Handlebars preview compiles {{gmail.count}}', handlebarsPreview.includes('Unread Count: 2'));
  assert('Handlebars preview compiles {{#each gmail.messages}} item 1', handlebarsPreview.includes('Subject: Order Confirmation #1001 | From: sales@shop.com'));
  assert('Handlebars preview compiles {{#each gmail.messages}} item 2', handlebarsPreview.includes('Subject: Invoice #1002 | From: billing@shop.com'));
  assert('Handlebars preview renders missing variable as empty string', handlebarsPreview.includes('Missing Var: []'));

  // ─── Test 3: Blank PDF Generation ─────────────────────────────────────────
  console.log('\nTest 3: Blank PDF Generation (Puppeteer)...');
  const blankResult = await PdfService.generatePdf({
    template: 'blank',
    content: '<h1 style="color:#6366f1;">AutomateX PDF Test</h1><p>This is a blank template test generated at ' + new Date().toISOString() + '</p>',
    variables: {},
    config: { brandColor: '#6366f1', companyName: 'AutomateX Inc.' },
    fileName: 'test_blank.pdf',
  });
  assert('Blank PDF buffer is a Buffer', Buffer.isBuffer(blankResult.buffer) || blankResult.buffer instanceof Uint8Array);
  assert('Blank PDF size > 1000 bytes', blankResult.size > 1000);
  assert('Blank PDF mimeType is application/pdf', blankResult.mimeType === 'application/pdf');
  assert('Blank PDF base64 is a non-empty string', typeof blankResult.base64 === 'string' && blankResult.base64.length > 0);
  assert('Blank PDF base64 starts with valid PDF magic bytes (JVBERi0x)', blankResult.base64.startsWith('JVBERi0x'));

  // Save to disk for visual inspection
  const testOutDir = path.join(__dirname, '..', 'test_pdfs');
  if (!fs.existsSync(testOutDir)) fs.mkdirSync(testOutDir, { recursive: true });
  fs.writeFileSync(path.join(testOutDir, 'test_blank.pdf'), Buffer.from(blankResult.base64, 'base64'));
  console.log(`   ℹ PDF saved: test_pdfs/test_blank.pdf`);

  // ─── Test 4: Invoice Template with Variables ───────────────────────────────
  console.log('\nTest 4: Invoice Template with Variable Resolution...');
  const invoiceResult = await PdfService.generatePdf({
    template: 'invoice',
    content: '',
    variables: {
      invoiceNumber: 'INV-2026-001',
      invoiceDate: '04 Aug 2026',
      dueDate: '18 Aug 2026',
      status: 'DUE',
      clientName: 'Divyansh Thakur',
      clientEmail: 'divyansh@example.com',
      clientAddress: '42 Tech Park, Jaipur, Rajasthan',
      itemDescription: 'AutomateX Enterprise License',
      quantity: '1',
      unitPrice: '₹12,000',
      totalAmount: '₹12,000',
      subtotal: '₹12,000',
      taxRate: '18',
      taxAmount: '₹2,160',
      discount: '₹0',
      totalDue: '₹14,160',
      notes: 'Payment due within 14 days. Thank you for your business!',
    },
    config: {
      brandColor: '#10b981',
      companyName: 'AutomateX Inc.',
      companyAddress: '100 Innovation Lane, Bengaluru, Karnataka',
      companyEmail: 'billing@automatex.io',
      companyPhone: '+91 9800000000',
      companyWebsite: 'https://automatex.io',
      showFooter: true,
    },
    fileName: 'invoice_INV-2026-001.pdf',
  });
  assert('Invoice PDF generated successfully', invoiceResult.size > 2000);
  assert('Invoice PDF base64 is valid', invoiceResult.base64.startsWith('JVBERi0x'));
  fs.writeFileSync(path.join(testOutDir, 'invoice_INV-2026-001.pdf'), Buffer.from(invoiceResult.base64, 'base64'));
  console.log(`   ℹ PDF saved: test_pdfs/invoice_INV-2026-001.pdf`);

  // ─── Test 5: Certificate Template ─────────────────────────────────────────
  console.log('\nTest 5: Certificate Template...');
  const certResult = await PdfService.generatePdf({
    template: 'certificate',
    content: '',
    variables: {
      certificateType: 'Completion',
      recipientName: 'Divyansh Thakur',
      description: 'has successfully completed the AutomateX Workflow Automation Developer Certification program with distinction.',
      authorizedBy: 'Priya Mehta',
      authorizedTitle: 'Chief Learning Officer',
      issueDate: '04 Aug 2026',
      certificateId: 'AX-CERT-2026-001',
    },
    config: {
      brandColor: '#f59e0b',
      companyName: 'AutomateX Academy',
      showFooter: false,
    },
    fileName: 'certificate_divyansh.pdf',
  });
  assert('Certificate PDF generated successfully', certResult.size > 2000);
  fs.writeFileSync(path.join(testOutDir, 'certificate_divyansh.pdf'), Buffer.from(certResult.base64, 'base64'));
  console.log(`   ℹ PDF saved: test_pdfs/certificate_divyansh.pdf`);

  // ─── Test 6: QR Code Embedding ────────────────────────────────────────────
  console.log('\nTest 6: QR Code Generation & Embedding...');
  const qrResult = await PdfService.generatePdf({
    template: 'invoice',
    content: '',
    variables: {
      invoiceNumber: 'INV-QR-001',
      invoiceDate: new Date().toLocaleDateString(),
      dueDate: '30 days',
      clientName: 'QR Test User',
      totalDue: '₹5,000',
      qrData: 'https://automatex.io/pay/INV-QR-001',
    },
    config: { brandColor: '#6366f1', companyName: 'AutomateX Inc.' },
    fileName: 'invoice_qr.pdf',
  });
  assert('Invoice with QR code generated', qrResult.size > 2000);
  fs.writeFileSync(path.join(testOutDir, 'invoice_qr.pdf'), Buffer.from(qrResult.base64, 'base64'));
  console.log(`   ℹ PDF saved: test_pdfs/invoice_qr.pdf`);

  // ─── Test 7: Custom HTML Template ─────────────────────────────────────────
  console.log('\nTest 7: Custom HTML Template...');
  const customResult = await PdfService.generatePdf({
    template: 'custom',
    content: `
      <div style="font-family:sans-serif;padding:40px;">
        <h1 style="color:#8b5cf6;">Custom PDF Document</h1>
        <p style="margin-top:16px;color:#475569;">This is a fully custom HTML template with CSS support.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:24px;">
          <thead><tr style="background:#8b5cf6;color:#fff;"><th style="padding:8px;">Item</th><th style="padding:8px;">Amount</th></tr></thead>
          <tbody>
            <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;">Product A</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">₹1,000</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;">Product B</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">₹2,500</td></tr>
          </tbody>
        </table>
      </div>
    `,
    variables: {},
    config: { brandColor: '#8b5cf6' },
    fileName: 'custom_doc.pdf',
  });
  assert('Custom HTML PDF generated', customResult.size > 1000);
  fs.writeFileSync(path.join(testOutDir, 'custom_doc.pdf'), Buffer.from(customResult.base64, 'base64'));
  console.log(`   ℹ PDF saved: test_pdfs/custom_doc.pdf`);

  // ─── Test 8: Watermark Support ────────────────────────────────────────────
  console.log('\nTest 8: Watermark Support...');
  const watermarkResult = await PdfService.generatePdf({
    template: 'blank',
    content: '<h2>Confidential Document</h2><p>This document has a watermark overlay.</p>',
    variables: {},
    config: { brandColor: '#ef4444', watermark: 'CONFIDENTIAL', watermarkOpacity: 0.07 },
    fileName: 'watermark_test.pdf',
  });
  assert('Watermarked PDF generated', watermarkResult.size > 1000);
  fs.writeFileSync(path.join(testOutDir, 'watermark_test.pdf'), Buffer.from(watermarkResult.base64, 'base64'));
  console.log(`   ℹ PDF saved: test_pdfs/watermark_test.pdf`);

  // ─── Test 9: PdfGeneratorExecutor variable resolution ─────────────────────
  console.log('\nTest 9: PdfGeneratorExecutor Variable Resolution...');
  const executor = new PdfGeneratorExecutor();
  const resolved = executor._resolveVariables(
    'invoice_{{trigger.body.orderId}}_{{now}}.pdf',
    { trigger: { body: { orderId: '1234' } } }
  );
  assert('Filename variable {{trigger.body.orderId}} resolves to 1234', resolved.includes('1234'));
  assert('Filename variable {{now}} resolves to today date', !resolved.includes('{{now}}'));

  // ─── Test 10: Full Demo Workflow — Executor executes and returns attachment ──
  console.log('\nTest 10: Full Workflow Demo — Executor End-to-End...');
  const execResult = await executor.execute(
    {
      id: 'pdf_node_1',
      type: 'pdfGenerator',
      config: {
        template: 'invoice',
        fileName: 'demo_invoice_{{trigger.body.orderId}}.pdf',
        pageSize: 'A4',
        orientation: 'portrait',
        outputMode: 'base64',
        brandColor: '#6366f1',
        companyName: 'AutomateX Inc.',
        showFooter: true,
        templateVariables: {
          invoiceNumber: 'INV-DEMO-001',
          invoiceDate: new Date().toLocaleDateString(),
          clientName: 'Workflow User',
          totalDue: '₹9,999',
        },
      },
    },
    {
      trigger: { body: { orderId: '99', name: 'Workflow User' } },
      workflowId: 'wf-demo-001',
      executionId: 'exec-demo-001',
    }
  );
  assert('Executor status is success', execResult.status === 'success');
  assert('Executor output.success is true', execResult.output.success === true);
  assert('Executor output.fileName is a string', typeof execResult.output.fileName === 'string');
  assert('Executor output.fileName resolves orderId', execResult.output.fileName.includes('99'));
  assert('Executor output.base64 starts with PDF magic bytes', execResult.output.base64?.startsWith('JVBERi0x'));
  assert('Executor output.attachment object exists', typeof execResult.output.attachment === 'object');
  assert('Executor attachment.contentType is application/pdf', execResult.output.attachment.contentType === 'application/pdf');
  assert('Executor output.size > 0', execResult.output.size > 0);
  console.log(`   ℹ Demo workflow PDF: ${execResult.output.fileName} (${execResult.output.size} bytes) generated in ${execResult.output.executionTime}ms`);
  fs.writeFileSync(path.join(testOutDir, 'demo_workflow_invoice.pdf'), Buffer.from(execResult.output.base64, 'base64'));
  console.log(`   ℹ PDF saved: test_pdfs/demo_workflow_invoice.pdf`);

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log(`\n=== Test Results: ${passed}/${total} Passed ===`);
  if (passed === total) {
    console.log('🎉 ALL PHASE 15.1 PDF GENERATOR TESTS PASSED PERFECTLY!');
    console.log(`\n📁 Generated PDFs saved in: backend/test_pdfs/\n`);
  } else {
    console.error(`❌ ${total - passed} test(s) failed.`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
