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
import { ExecutionEngine } from './engine/ExecutionEngine.js';
import { normalizeFileId } from './utils/fileUtils.js';

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
    <w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Resume</w:t></w:r></w:p>
    <w:p><w:r><w:t>Name: Jane Doe</w:t></w:r></w:p>
    <w:p><w:r><w:t>Role: Senior Software Engineer</w:t></w:r></w:p>
    <w:p><w:r><w:t>Skills: JavaScript, Node.js, React</w:t></w:r></w:p>
  </w:body>
</w:document>`;

  zip.file('word/document.xml', docXml);

  return await zip.generateAsync({ type: 'nodebuffer' });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 AUTOMATEX DOCUMENT EXTRACT FIX VERIFICATION TEST');
  console.log('======================================================\n');

  try {
    // 1. Test normalizeFileId Rules directly
    console.log('1️⃣ TESTING CANONICAL FILE ID NORMALIZATION RULES');

    assert(normalizeFileId("file_ABC123") === "file_ABC123", 'Input "file_ABC123" -> "file_ABC123"');
    assert(normalizeFileId({ id: "file_ABC123" }) === "file_ABC123", 'Input { id: "file_ABC123" } -> "file_ABC123"');
    assert(normalizeFileId("file_ABC123file_ABC123") === "file_ABC123", 'Input "file_ABC123file_ABC123" -> "file_ABC123" (Deduplicated)');
    assert(normalizeFileId("file_e0b6972d9cd05b780da1eab0file_e0b6972d9cd05b780da1eab0") === "file_e0b6972d9cd05b780da1eab0", 'Exact error string deduplicated to "file_e0b6972d9cd05b780da1eab0"');
    assert(normalizeFileId({ file: { id: "file_ABC123" } }) === "file_ABC123", 'Nested object input extracted correctly');

    await connectDB();

    // 2. Setup Test User & JWT Token
    const userId = new mongoose.Types.ObjectId();
    await User.deleteMany({ email: 'doc_fix_user@automatex.com' });

    const user = await User.create({
      _id: userId,
      name: 'Doc Fix User',
      email: 'doc_fix_user@automatex.com',
      password: 'password123',
    });

    const jwtSecret = process.env.JWT_SECRET || 'workflow_platform_super_secret_key_2026';
    const token = jwt.sign({ id: user._id.toString() }, jwtSecret, { expiresIn: '1h' });

    console.log('\n2️⃣ UPLOADING resume.docx VIA API');
    const docxBuffer = await buildTestDOCXBuffer();

    const uploadRes = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', docxBuffer, 'resume.docx');

    assert(uploadRes.status === 200, 'File Upload API returned status 200');
    assert(uploadRes.body.success === true, 'Upload API returned success === true');
    assert(Boolean(uploadRes.body.file?.id), `Upload API returned file ID: ${uploadRes.body.file?.id}`);

    const uploadedFileId = uploadRes.body.file.id;

    console.log('\n3️⃣ EXECUTING EXACT WORKFLOW: Start -> File Upload -> Document Extract -> End Completion');

    const testWorkflowGraph = {
      _id: 'wf_doc_extract_fix_001',
      title: 'Document Extract Bug Fix Verification Workflow',
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
            config: { fileId: uploadedFileId, file: uploadRes.body.file },
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
          id: 'ai_downstream_node',
          type: 'aiGenerateText',
          data: {
            label: 'AI → Downstream Step',
            config: { prompt: 'Extracted content text: {{steps["Document → Extract Content"].content.text}}' },
          },
        },
        {
          id: 'end_node',
          type: 'end',
          data: { label: 'End Completion' },
        },
      ],
      edges: [
        { id: 'e1', source: 'start_node', target: 'upload_node' },
        { id: 'e2', source: 'upload_node', target: 'extract_node' },
        { id: 'e3', source: 'extract_node', target: 'ai_downstream_node' },
        { id: 'e4', source: 'ai_downstream_node', target: 'end_node' },
      ],
    };

    const executionLog = await ExecutionEngine.executeWorkflow(testWorkflowGraph, {}, 'MANUAL', user._id);

    assert(executionLog.status === 'SUCCESS', 'Workflow Execution completed with status SUCCESS');

    const uploadStep = executionLog.stepResults.find((s) => s.nodeId === 'upload_node');
    assert(uploadStep && uploadStep.status === 'SUCCESS', 'File → Upload Document step status is SUCCESS');

    const extractStep = executionLog.stepResults.find((s) => s.nodeId === 'extract_node');
    assert(extractStep && extractStep.status === 'SUCCESS', 'Document → Extract Content step status is SUCCESS');
    assert(extractStep.outputData?.success === true, 'Document Extract outputData.success === true');
    assert(extractStep.outputData?.file?.id === uploadedFileId, `Document Extract output file ID matches expected '${uploadedFileId}'`);
    assert(typeof extractStep.outputData?.content?.text === 'string', 'Extracted content text is a valid string');
    assert(extractStep.outputData.content.text.includes('Jane Doe'), 'Extracted content contains "Jane Doe"');

    const aiStep = executionLog.stepResults.find((s) => s.nodeId === 'ai_downstream_node');
    assert(aiStep && aiStep.status === 'SUCCESS', 'Downstream step consuming {{steps["Document → Extract Content"].content.text}} executed successfully');

    console.log('\n4️⃣ TESTING DIRECT DUPLICATED FILE ID RESOLUTION IN WORKFLOW');

    // Manually pass a duplicated file ID in config to verify runtime deduplication:
    testWorkflowGraph.nodes[2].data.config.fileId = `${uploadedFileId}${uploadedFileId}`;

    const executionLogDuplicatedConfig = await ExecutionEngine.executeWorkflow(testWorkflowGraph, {}, 'MANUAL', user._id);
    assert(executionLogDuplicatedConfig.status === 'SUCCESS', 'Execution Engine handles duplicated file ID config and normalizes to single canonical ID');

    // Cleanup
    await User.deleteMany({ email: 'doc_fix_user@automatex.com' });
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
