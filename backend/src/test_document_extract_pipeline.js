import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const request = require('supertest');
const JSZip = require('jszip') || require('xlsx/jszip');

import './env.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from './app.js';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { FileModel } from './models/File.js';
import { Workflow } from './models/Workflow.js';
import { ExecutionEngine } from './engine/ExecutionEngine.js';

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
    <w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Catalog</w:t></w:r></w:p>
    <w:p><w:r><w:t>Product Name: Nike Air Max</w:t></w:r></w:p>
    <w:p><w:r><w:t>Price: 5999</w:t></w:r></w:p>
  </w:body>
</w:document>`;

  zip.file('word/document.xml', docXml);

  return await zip.generateAsync({ type: 'nodebuffer' });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 AUTOMATEX END-TO-END FILE RESOLUTION PIPELINE TEST');
  console.log('======================================================\n');

  try {
    await connectDB();

    // 1. Create Test User
    const userId = new mongoose.Types.ObjectId();
    await User.deleteMany({ email: 'pipeline_user@automatex.com' });

    const user = await User.create({
      _id: userId,
      name: 'Pipeline User',
      email: 'pipeline_user@automatex.com',
      password: 'password123',
    });

    const jwtSecret = process.env.JWT_SECRET || 'workflow_platform_super_secret_key_2026';
    const token = jwt.sign({ id: user._id.toString() }, jwtSecret, { expiresIn: '1h' });

    console.log('1️⃣ UPLOADING TEST DOCUMENT VIA API');
    const docxBuffer = await buildTestDOCXBuffer();

    const uploadRes = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', docxBuffer, 'catalog.docx');

    assert(uploadRes.status === 200, 'File Upload API returned 200');
    const uploadedFileId = uploadRes.body.file?.id;
    assert(Boolean(uploadedFileId), `Uploaded file received ID: ${uploadedFileId}`);

    console.log('\n2️⃣ EXECUTING END-TO-END WORKFLOW WITH DYNAMIC VARIABLE EXPRESSION');

    const testWorkflowGraph = {
      _id: 'wf_pipeline_test_101',
      title: 'End to End Product Import Workflow',
      user: user._id,
      nodes: [
        {
          id: 'start_node',
          type: 'start',
          data: { label: 'Start Trigger' },
        },
        {
          id: 'upload_node',
          type: 'fileUpload',
          data: {
            label: 'File → Upload Document',
            config: { fileId: uploadedFileId },
          },
        },
        {
          id: 'extract_node',
          type: 'documentExtractContent',
          data: {
            label: 'Document → Extract Content',
            config: { fileId: '{{steps["File → Upload Document"].file.id}}' },
          },
        },
        {
          id: 'ai_node',
          type: 'aiGenerateText',
          data: {
            label: 'AI → Generate Text',
            config: { prompt: 'Summarize text: {{steps["Document → Extract Content"].content.text}}' },
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'start_node', target: 'upload_node' },
        { id: 'e2', source: 'upload_node', target: 'extract_node' },
        { id: 'e3', source: 'extract_node', target: 'ai_node' },
      ],
    };

    const executionLog = await ExecutionEngine.executeWorkflow(testWorkflowGraph, {}, 'MANUAL', user._id);

    assert(executionLog.status === 'SUCCESS', 'Execution Engine completed workflow with status SUCCESS');
    assert(executionLog.stepResults.length === 4, 'All 4 steps executed successfully');

    const extractStep = executionLog.stepResults.find((s) => s.nodeId === 'extract_node');
    assert(extractStep && extractStep.status === 'SUCCESS', 'Document Extract step succeeded');
    assert(extractStep.outputData?.content?.text.includes('Nike Air Max'), 'Extracted text contains "Nike Air Max"');

    const aiStep = executionLog.stepResults.find((s) => s.nodeId === 'ai_node');
    assert(aiStep && aiStep.status === 'SUCCESS', 'AI step received extracted text via expression interpolation');

    console.log('\n3️⃣ TESTING SHORTCUT EXPRESSION {{steps["File → Upload Document"].fileId}}');

    testWorkflowGraph.nodes[2].data.config.fileId = '{{steps["File → Upload Document"].fileId}}';
    const executionLogShortcut = await ExecutionEngine.executeWorkflow(testWorkflowGraph, {}, 'MANUAL', user._id);

    assert(executionLogShortcut.status === 'SUCCESS', 'Execution Engine resolved top-level .fileId shortcut expression');

    console.log('\n4️⃣ TESTING STATIC FILE ID IN CONFIG');

    testWorkflowGraph.nodes[2].data.config.fileId = uploadedFileId;
    const executionLogStatic = await ExecutionEngine.executeWorkflow(testWorkflowGraph, {}, 'MANUAL', user._id);

    assert(executionLogStatic.status === 'SUCCESS', 'Execution Engine resolved static file ID directly');

    // Cleanup
    await User.deleteMany({ email: 'pipeline_user@automatex.com' });
    await FileModel.deleteMany({ id: uploadedFileId });

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
