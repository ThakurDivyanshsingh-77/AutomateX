import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const request = require('supertest');
const JSZip = require('jszip') || require('xlsx/jszip');
import * as XLSX from 'xlsx';

import './env.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from './app.js';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { FileModel } from './models/File.js';
import { Workflow } from './models/Workflow.js';
import { executorRegistry } from './engine/ExecutorRegistry.js';
import { ExecutionContext } from './engine/ExecutionContext.js';
import { fileStorageService } from './services/FileStorageService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASSED: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAILED: ${message}`);
    failed++;
  }
}

/**
 * Helper to build a valid sample DOCX buffer in memory
 */
async function buildTestDOCXBuffer() {
  const zip = new JSZip();

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Products Catalog</w:t></w:r></w:p>
    <w:p><w:r><w:t>Product Name: Nike Air Max</w:t></w:r></w:p>
    <w:p><w:r><w:t>Description: Running shoes for daily training.</w:t></w:r></w:p>
    <w:p><w:r><w:t>Price: 5999</w:t></w:r></w:p>
    <w:p><w:r><w:t>Category: Shoes</w:t></w:r></w:p>
    <w:tbl>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Product Name</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Description</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Price</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Category</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Nike Air Max</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Running shoes</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>5999</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Shoes</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Adidas Ultra</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Sports shoes</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>7999</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Shoes</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>`;

  zip.file('word/document.xml', docXml);

  return await zip.generateAsync({ type: 'nodebuffer' });
}

/**
 * Helper to build a valid sample XLSX buffer in memory
 */
function buildTestXLSXBuffer() {
  const wb = XLSX.utils.book_new();
  const wsData = [
    ['Product Name', 'Description', 'Price', 'Category'],
    ['Nike Air Max', 'Running shoes', 5999, 'Shoes'],
    ['Adidas Ultra', 'Sports shoes', 7999, 'Shoes'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 AUTOMATEX DOCUMENT EXTRACT CONTENT TEST SUITE');
  console.log('======================================================\n');

  try {
    await connectDB();

    // 1. Create Test Users
    const userAId = new mongoose.Types.ObjectId();
    const userBId = new mongoose.Types.ObjectId();

    await User.deleteMany({ email: { $in: ['doc_user_a@automatex.com', 'doc_user_b@automatex.com'] } });

    const userA = await User.create({
      _id: userAId,
      name: 'Doc User A',
      email: 'doc_user_a@automatex.com',
      password: 'password123',
    });

    const userB = await User.create({
      _id: userBId,
      name: 'Doc User B',
      email: 'doc_user_b@automatex.com',
      password: 'password123',
    });

    const jwtSecret = process.env.JWT_SECRET || 'workflow_platform_super_secret_key_2026';
    const tokenA = jwt.sign({ id: userA._id.toString() }, jwtSecret, { expiresIn: '1h' });
    const tokenB = jwt.sign({ id: userB._id.toString() }, jwtSecret, { expiresIn: '1h' });

    console.log('1️⃣ UPLOADING TEST DOCUMENTS');

    const docxBuffer = await buildTestDOCXBuffer();
    const xlsxBuffer = buildTestXLSXBuffer();

    // Upload DOCX file for User A
    const resDocxUpload = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${tokenA}`)
      .attach('file', docxBuffer, 'products_catalog.docx');

    assert(resDocxUpload.status === 200, 'DOCX file uploaded successfully');
    const docxFileId = resDocxUpload.body.file?.id;

    // Upload XLSX file for User A
    const resXlsxUpload = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${tokenA}`)
      .attach('file', xlsxBuffer, 'products_inventory.xlsx');

    assert(resXlsxUpload.status === 200, 'XLSX file uploaded successfully');
    const xlsxFileId = resXlsxUpload.body.file?.id;

    console.log('\n2️⃣ TESTING DOCX DOCUMENT CONTENT EXTRACTION');

    const docxExecutor = executorRegistry.getExecutor('documentExtractContent');
    const contextA = new ExecutionContext();
    contextA.user = userA;

    const docxNodePayload = {
      id: 'node_doc_extract',
      type: 'documentExtractContent',
      config: {
        fileId: docxFileId,
        extractionMode: 'full',
      },
    };

    const docxResult = await docxExecutor.execute(docxNodePayload, contextA);

    assert(docxResult.success === true, 'DOCX extraction returns success === true');
    assert(docxResult.file?.id === docxFileId, 'Response file ID matches input file ID');
    assert(typeof docxResult.content?.text === 'string', 'Extracted content has combined text string');
    assert(docxResult.content.text.includes('Nike Air Max'), 'Extracted text contains "Nike Air Max"');
    assert(docxResult.content.text.includes('5999'), 'Extracted text contains "5999"');

    assert(Array.isArray(docxResult.content?.paragraphs), 'Extracted content has paragraphs array');
    assert(docxResult.content.paragraphs.length >= 4, 'Extracted at least 4 paragraphs');

    assert(Array.isArray(docxResult.content?.headings), 'Extracted content has headings array');
    assert(docxResult.content.headings.some((h) => h.text.includes('Products Catalog')), 'Extracted "Products Catalog" heading');

    assert(Array.isArray(docxResult.content?.tables), 'Extracted content has tables array');
    assert(docxResult.content.tables.length === 1, 'Extracted exactly 1 table');

    const table = docxResult.content.tables[0];
    assert(table.headers.includes('Product Name'), 'Table headers contain "Product Name"');
    assert(table.headers.includes('Price'), 'Table headers contain "Price"');
    assert(table.rows.length === 2, 'Table contains 2 product rows');
    assert(table.rows[0][0] === 'Nike Air Max', 'Row 1 Product Name is "Nike Air Max"');
    assert(table.rows[0][2] === '5999', 'Row 1 Price is "5999"');
    assert(table.rows[1][0] === 'Adidas Ultra', 'Row 2 Product Name is "Adidas Ultra"');
    assert(table.rows[1][2] === '7999', 'Row 2 Price is "7999"');

    assert(Array.isArray(docxResult.content?.blocks), 'Extracted content has ordered document blocks array');
    assert(docxResult.content.blocks.length >= 5, 'Blocks array contains top-to-bottom document elements');

    console.log('\n3️⃣ TESTING EXCEL (XLSX) TABLE EXTRACTION');

    const xlsxNodePayload = {
      id: 'node_excel_extract',
      type: 'documentExtractContent',
      config: {
        fileId: xlsxFileId,
        extractionMode: 'full',
      },
    };

    const xlsxResult = await docxExecutor.execute(xlsxNodePayload, contextA);

    assert(xlsxResult.success === true, 'XLSX extraction returns success === true');
    assert(xlsxResult.content.tables.length === 1, 'Extracted 1 sheet table from XLSX');
    assert(xlsxResult.content.tables[0].headers.includes('Product Name'), 'XLSX headers include "Product Name"');
    assert(xlsxResult.content.tables[0].rows[0][0] === 'Nike Air Max', 'XLSX Row 1 Product Name is "Nike Air Max"');

    console.log('\n4️⃣ TESTING SECURITY, ISOLATION & ERROR HANDLING');

    // User B attempting to parse User A's file
    const contextB = new ExecutionContext();
    contextB.user = userB;

    let userBIsolationFailed = false;
    try {
      await docxExecutor.execute(docxNodePayload, contextB);
    } catch (err) {
      userBIsolationFailed = true;
      assert(err.code === 'ACCESS_DENIED', 'User B accessing User A\'s document throws ACCESS_DENIED error');
    }
    assert(userBIsolationFailed, 'User B isolation check correctly blocked unauthorized access');

    // Missing file ID
    let missingFileFailed = false;
    try {
      await docxExecutor.execute({ id: 'bad', type: 'documentExtractContent', config: { fileId: '' } }, contextA);
    } catch (err) {
      missingFileFailed = true;
      assert(err.code === 'FILE_NOT_FOUND', 'Missing file ID throws FILE_NOT_FOUND error');
    }
    assert(missingFileFailed, 'Missing file ID check correctly caught');

    console.log('\n5️⃣ TESTING END-TO-END WORKFLOW INTEGRATION');

    // Create workflow: Start -> Upload Document -> Extract Content -> End
    await Workflow.deleteMany({ title: 'Full Phase 2 Pipeline Workflow' });

    const workflowDoc = await Workflow.create({
      title: 'Full Phase 2 Pipeline Workflow',
      userId: userA._id,
      nodes: [
        {
          id: 'node_upload',
          type: 'fileUpload',
          data: {
            label: 'File → Upload Document',
            config: { fileId: docxFileId },
          },
        },
        {
          id: 'node_extract',
          type: 'documentExtractContent',
          data: {
            label: 'Document → Extract Content',
            config: { fileId: '{{steps["File → Upload Document"].file.id}}' },
          },
        },
      ],
      edges: [
        {
          id: 'edge1',
          source: 'node_upload',
          target: 'node_extract',
        },
      ],
      status: 'active',
    });

    assert(workflowDoc && workflowDoc._id, 'Full Phase 2 workflow saved in database');

    // Test Mustache variable interpolation of file ID from previous step output
    const mockContext = new ExecutionContext();
    mockContext.setStepOutput('File → Upload Document', {
      success: true,
      file: {
        id: docxFileId,
        name: 'products_catalog.docx',
      },
    });

    const pipelineResult = await docxExecutor.execute(
      {
        id: 'node_extract',
        type: 'documentExtractContent',
        data: {
          config: {
            fileId: '{{steps["File → Upload Document"].file.id}}',
          },
        },
      },
      mockContext
    );

    assert(pipelineResult.success === true, 'End-to-End workflow variable interpolation resolved file ID');
    assert(pipelineResult.file.name === 'products_catalog.docx', 'Resolved document name matches uploaded file');
    assert(pipelineResult.content.tables.length === 1, 'End-to-End workflow extracted structured table');
    assert(pipelineResult.content.paragraphs.length >= 4, 'End-to-End workflow extracted paragraphs');

    // Cleanup
    await User.deleteMany({ email: { $in: ['doc_user_a@automatex.com', 'doc_user_b@automatex.com'] } });
    await Workflow.deleteMany({ title: 'Full Phase 2 Pipeline Workflow' });

  } catch (err) {
    console.error('🔴 Test execution error:', err);
    failed++;
  } finally {
    await mongoose.connection.close();
    console.log('\n======================================================');
    console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
