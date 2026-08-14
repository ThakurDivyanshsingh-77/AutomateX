import fs from 'fs';
import path from 'path';
import { storageService } from './services/StorageService.js';
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

/**
 * Builds a valid minimal PDF buffer with text "Jane Doe Resume"
 */
function buildSamplePDFBuffer() {
  const text = "Jane Doe Resume\nRole: Senior Full Stack Engineer\nSkills: React, Node.js, MongoDB\nExperience: 5 years in workflow automation platforms.";
  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 150 >>
stream
BT
/F1 12 Tf
72 712 Td
(${text.replace(/\n/g, '\\n')}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000445 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
514
%%EOF`;

  return Buffer.from(pdfString);
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 AUTOMATEX STORAGE SERVICE & LIFECYCLE VERIFICATION');
  console.log('======================================================\n');

  try {
    const pdfBuffer = buildSamplePDFBuffer();
    const mockOwnerId = 'usr_64a1b2c3d4e5f60718293a4b';

    // 1. Test StorageService.save()
    console.log('1️⃣ TESTING StorageService.save()');
    const savedFile = await storageService.save({
      buffer: pdfBuffer,
      originalName: 'resume.pdf',
      mimeType: 'application/pdf',
      ownerId: mockOwnerId,
    });

    assert(Boolean(savedFile.id), `StorageService.save created file with ID: ${savedFile.id}`);
    assert(savedFile.name === 'resume.pdf', `Saved file name matches 'resume.pdf'`);
    assert(savedFile.size === pdfBuffer.length, `Saved file size (${savedFile.size}) matches buffer length`);

    const fileId = savedFile.id;

    // 2. Test StorageService.get() and exists()
    console.log('\n2️⃣ TESTING StorageService.get(), exists(), getBuffer()');
    const retrievedDoc = await storageService.get(fileId, mockOwnerId);
    assert(retrievedDoc && retrievedDoc.id === fileId, 'StorageService.get() retrieved file metadata');

    const exists = await storageService.exists(fileId, mockOwnerId);
    assert(exists === true, 'StorageService.exists() returned true');

    const bufferRes = await storageService.getBuffer(fileId, mockOwnerId);
    assert(bufferRes.buffer && bufferRes.buffer.length === pdfBuffer.length, 'StorageService.getBuffer() returned valid buffer');
    assert(bufferRes.storageExists === true, 'Buffer result has storageExists === true');

    // 3. Test End-to-End Workflow Execution
    console.log('\n3️⃣ EXECUTING END-TO-END WORKFLOW (Upload -> Extract -> End)');

    const testWorkflowGraph = {
      _id: 'wf_storage_lifecycle_001',
      title: 'Document Storage Lifecycle Workflow',
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
              fileId: fileId,
              file: savedFile,
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
              extractionMode: 'full',
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

    assert(executionLog.status === 'SUCCESS', 'Execution Engine completed workflow with status SUCCESS');

    const uploadStep = executionLog.stepResults.find((s) => s.nodeId === 'upload_node');
    assert(uploadStep && uploadStep.status === 'SUCCESS', 'File → Upload Document step status === SUCCESS');
    assert(uploadStep.outputData?.file?.id === fileId, `File Upload output contains expected file ID: ${fileId}`);

    const extractStep = executionLog.stepResults.find((s) => s.nodeId === 'extract_node');
    assert(extractStep && extractStep.status === 'SUCCESS', 'Document → Extract Content step status === SUCCESS');
    assert(extractStep.outputData?.success === true, 'Document Extract outputData.success === true');
    assert(typeof extractStep.outputData?.content?.text === 'string', 'Extracted content text is a valid string');
    assert(extractStep.outputData?.content?.text.includes('Jane Doe'), 'Extracted text contains "Jane Doe"');
    assert(Array.isArray(extractStep.outputData?.content?.paragraphs), 'Extracted content contains paragraphs array');
    assert(Array.isArray(extractStep.outputData?.content?.headings), 'Extracted content contains headings array');
    assert(Array.isArray(extractStep.outputData?.content?.tables), 'Extracted content contains tables array');
    assert(Array.isArray(extractStep.outputData?.content?.blocks), 'Extracted content contains blocks array');

    // 4. Test Render Restart / Missing Disk File Rehydration
    console.log('\n4️⃣ TESTING RENDER EPHEMERAL DISK SIMULATION (Physical file missing -> Rehydrated from Storage)');
    if (savedFile.storagePath && fs.existsSync(savedFile.storagePath)) {
      // Simulate ephemeral disk wipe on Render
      fs.unlinkSync(savedFile.storagePath);
      assert(!fs.existsSync(savedFile.storagePath), 'Simulated Render disk wipe: Physical disk file removed');
    }

    // Run a NEW workflow execution with the wiped disk file
    const newWorkflowExecution = await ExecutionEngine.executeWorkflow(testWorkflowGraph, {}, 'MANUAL', mockOwnerId);
    assert(newWorkflowExecution.status === 'SUCCESS', 'New workflow execution succeeded despite missing physical disk file (Recovered via StorageService)');

    const rehydratedExtractStep = newWorkflowExecution.stepResults.find((s) => s.nodeId === 'extract_node');
    assert(rehydratedExtractStep && rehydratedExtractStep.status === 'SUCCESS', 'Rehydrated Document Extract step succeeded');
    assert(rehydratedExtractStep.outputData?.content?.text.includes('Jane Doe'), 'Rehydrated content text matches');

    // 5. Test Downstream Variable Resolution
    console.log('\n5️⃣ TESTING DOWNSTREAM VARIABLE RESOLUTION {{steps["Document → Extract Content"].content.text}}');
    testWorkflowGraph.nodes.push({
      id: 'downstream_log_node',
      type: 'LOG_ACTION',
      data: {
        label: 'Downstream Logger',
        config: {
          message: 'Downstream Text: {{steps["Document → Extract Content"].content.text}}',
        },
      },
    });
    testWorkflowGraph.edges.push({ id: 'e4', source: 'extract_node', target: 'downstream_log_node' });

    const downstreamWorkflow = await ExecutionEngine.executeWorkflow(testWorkflowGraph, {}, 'MANUAL', mockOwnerId);
    assert(downstreamWorkflow.status === 'SUCCESS', 'Downstream workflow completed with SUCCESS');

    // Cleanup
    await storageService.delete(fileId, mockOwnerId);

  } catch (err) {
    console.error('🔴 Storage Lifecycle Test Error:', err);
    failed++;
  } finally {
    console.log('\n======================================================');
    console.log(`📊 STORAGE LIFECYCLE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
