import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { FileModel } from './models/File.js';
import { ExecutionEngine } from './engine/ExecutionEngine.js';
import { documentParserService } from './engine/parser/DocumentParserService.js';
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

async function runDirectTests() {
  console.log('\n======================================================');
  console.log('🧪 AUTOMATEX DIRECT WORKFLOW & NORMALIZATION TEST');
  console.log('======================================================\n');

  try {
    // 1. Verify Canonical File ID Normalization Function Rules
    console.log('1️⃣ TESTING normalizeFileId CANONICAL RULES');
    assert(normalizeFileId("file_ABC123") === "file_ABC123", 'Input "file_ABC123" -> "file_ABC123"');
    assert(normalizeFileId({ id: "file_ABC123" }) === "file_ABC123", 'Input { id: "file_ABC123" } -> "file_ABC123"');
    assert(normalizeFileId("file_ABC123file_ABC123") === "file_ABC123", 'Input "file_ABC123file_ABC123" -> "file_ABC123"');
    assert(normalizeFileId("file_e0b6972d9cd05b780da1eab0file_e0b6972d9cd05b780da1eab0") === "file_e0b6972d9cd05b780da1eab0", 'Exact error duplicate string normalized to single ID');
    assert(normalizeFileId({ file: { id: "file_ABC123file_ABC123" } }) === "file_ABC123", 'Nested duplicate object extracted and normalized');

    const mockOwnerId = new mongoose.Types.ObjectId().toString();
    const mockFileId = 'file_e0b6972d9cd05b780da1eab0';
    const mockStoragePath = path.join(process.cwd(), 'uploads', 'resume.pdf');

    // Create dummy physical file
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(mockStoragePath, 'Dummy PDF content for testing');

    // Mock FileModel.findOne to avoid database connection dependency during standalone test
    const originalFindOne = FileModel.findOne;
    FileModel.findOne = async function ({ id }) {
      if (id === mockFileId) {
        return {
          id: mockFileId,
          ownerId: mockOwnerId,
          originalName: 'resume.pdf',
          storedName: `${mockFileId}.pdf`,
          storagePath: mockStoragePath,
          mimeType: 'application/pdf',
          extension: '.pdf',
          size: 1024,
          status: 'uploaded',
        };
      }
      return null;
    };

    // Mock document parser service for fast test execution
    const originalParseDocument = documentParserService.parseDocument;
    documentParserService.parseDocument = async function () {
      return {
        text: 'Jane Doe Resume\nSenior Software Engineer',
        paragraphs: [{ index: 0, text: 'Jane Doe Resume' }],
        headings: [{ level: 1, text: 'Resume' }],
        tables: [],
        blocks: [{ type: 'paragraph', text: 'Jane Doe Resume' }],
      };
    };

    console.log('\n2️⃣ EXECUTING WORKFLOW GRAPH WITH VARIABLE RESOLUTION');

    const testWorkflowGraph = {
      _id: 'wf_doc_extract_direct_01',
      title: 'Direct Document Extract Pipeline',
      user: mockOwnerId,
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
            config: {
              fileId: mockFileId,
              file: {
                id: mockFileId,
                name: 'resume.pdf',
                originalName: 'resume.pdf',
                mimeType: 'application/pdf',
                size: 1024,
                extension: '.pdf',
                status: 'uploaded',
              },
            },
          },
        },
        {
          id: 'extract_node',
          type: 'documentExtractContent',
          data: {
            label: 'Document → Extract Content',
            config: {
              fileId: '{{steps["File → Upload Document"].file.id}}',
            },
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
        { id: 'e3', source: 'extract_node', target: 'end_node' },
      ],
    };

    const executionLog = await ExecutionEngine.executeWorkflow(testWorkflowGraph, {}, 'MANUAL', mockOwnerId);

    assert(executionLog.status === 'SUCCESS', 'Execution Engine status === SUCCESS');

    const uploadStep = executionLog.stepResults.find((s) => s.nodeId === 'upload_node');
    assert(uploadStep && uploadStep.status === 'SUCCESS', 'File → Upload Document step status === SUCCESS');
    assert(uploadStep.outputData?.file?.id === mockFileId, 'File Upload output contains expected file.id');

    const extractStep = executionLog.stepResults.find((s) => s.nodeId === 'extract_node');
    assert(extractStep && extractStep.status === 'SUCCESS', 'Document → Extract Content step status === SUCCESS');
    assert(extractStep.outputData?.content?.text?.includes('Jane Doe'), 'Extracted text contains "Jane Doe"');

    console.log('\n3️⃣ TESTING {{steps["Document → Extract Content"].content.text}} DOWNSTREAM VARIABLE');

    testWorkflowGraph.nodes.push({
      id: 'downstream_node',
      type: 'LOG_ACTION',
      data: {
        label: 'Log Output',
        config: {
          message: 'Downstream input: {{steps["Document → Extract Content"].content.text}}',
        },
      },
    });
    testWorkflowGraph.edges.push({ id: 'e4', source: 'extract_node', target: 'downstream_node' });

    const downstreamLog = await ExecutionEngine.executeWorkflow(testWorkflowGraph, {}, 'MANUAL', mockOwnerId);
    assert(downstreamLog.status === 'SUCCESS', 'Downstream step resolving {{steps["Document → Extract Content"].content.text}} succeeded');

    const downstreamStep = downstreamLog.stepResults.find((s) => s.nodeId === 'downstream_node');
    assert(downstreamStep && downstreamStep.status === 'SUCCESS', 'Downstream Log step executed successfully');

    // Restore originals
    FileModel.findOne = originalFindOne;
    documentParserService.parseDocument = originalParseDocument;
    if (fs.existsSync(mockStoragePath)) fs.unlinkSync(mockStoragePath);

  } catch (err) {
    console.error('🔴 Direct Test Error:', err);
    failed++;
  } finally {
    console.log('\n======================================================');
    console.log(`📊 DIRECT TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runDirectTests();
