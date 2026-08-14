import fs from 'fs';
import path from 'path';
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

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 AUTOMATEX CANONICAL FILE ID NORMALIZATION UNIT TEST');
  console.log('======================================================\n');

  try {
    // 1. Verify Rules for normalizeFileId
    console.log('1️⃣ TESTING normalizeFileId RULES');

    assert(normalizeFileId("file_ABC123") === "file_ABC123", 'Input "file_ABC123" -> "file_ABC123"');
    assert(normalizeFileId({ id: "file_ABC123" }) === "file_ABC123", 'Input { id: "file_ABC123" } -> "file_ABC123"');
    assert(normalizeFileId("file_ABC123file_ABC123") === "file_ABC123", 'Input "file_ABC123file_ABC123" -> "file_ABC123"');
    assert(normalizeFileId("file_e0b6972d9cd05b780da1eab0file_e0b6972d9cd05b780da1eab0") === "file_e0b6972d9cd05b780da1eab0", 'Exact error duplicated file ID string -> "file_e0b6972d9cd05b780da1eab0"');
    assert(normalizeFileId({ file: { id: "file_ABC123file_ABC123" } }) === "file_ABC123", 'Nested object duplicated ID -> "file_ABC123"');
    assert(normalizeFileId('{"id":"file_ABC123"}') === "file_ABC123", 'JSON string {"id":"file_ABC123"} -> "file_ABC123"');

    console.log('\n2️⃣ TESTING DocumentExtractContentExecutor INTEGRATION');

    const { DocumentExtractContentExecutor } = await import('./engine/executors/DocumentExtractContentExecutor.js');
    const { ExecutionContext } = await import('./engine/ExecutionContext.js');
    const { FileModel } = await import('./models/File.js');
    const { documentParserService } = await import('./engine/parser/DocumentParserService.js');

    const mockFileId = 'file_e0b6972d9cd05b780da1eab0';
    const mockStoragePath = path.join(process.cwd(), 'uploads', 'resume_test.pdf');

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(mockStoragePath, 'Dummy document content');

    // Mock DB query
    FileModel.findOne = async function ({ id }) {
      if (id === mockFileId) {
        return {
          id: mockFileId,
          ownerId: 'user_123',
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

    // Mock parser
    documentParserService.parseDocument = async function () {
      return {
        text: 'Jane Doe Resume\nSkills: JS, Node',
        paragraphs: [{ index: 0, text: 'Jane Doe Resume' }],
        headings: [{ level: 1, text: 'Resume' }],
        tables: [],
        blocks: [{ type: 'paragraph', text: 'Jane Doe Resume' }],
      };
    };

    const executor = new DocumentExtractContentExecutor();

    // Test Case A: Clean file ID
    const contextA = new ExecutionContext();
    const resA = await executor.execute({
      id: 'node_extract',
      config: { fileId: mockFileId },
    }, contextA);

    assert(resA.success === true, 'Clean file ID execution succeeded');
    assert(resA.file?.id === mockFileId, `File ID is clean: ${resA.file?.id}`);

    // Test Case B: DUPLICATED file ID input (the bug condition: file_e0b6...file_e0b6...)
    const contextB = new ExecutionContext();
    const resB = await executor.execute({
      id: 'node_extract',
      config: { fileId: `${mockFileId}${mockFileId}` },
    }, contextB);

    assert(resB.success === true, 'Duplicated file ID input execution succeeded via normalizeFileId');
    assert(resB.file?.id === mockFileId, `Normalized file ID matches canonical ID: ${resB.file?.id}`);
    assert(resB.content?.text?.includes('Jane Doe'), 'Extracted text content returned correctly');

    // Test Case C: Variable expression resolution output
    const contextC = new ExecutionContext();
    contextC.setNodeOutput('File → Upload Document', {
      success: true,
      file: { id: mockFileId, name: 'resume.pdf' },
    });

    const resC = await executor.execute({
      id: 'node_extract',
      config: { fileId: '{{steps["File → Upload Document"].file.id}}' },
    }, contextC);

    assert(resC.success === true, 'Variable expression {{steps["File → Upload Document"].file.id}} execution succeeded');
    assert(resC.file?.id === mockFileId, 'Resolved variable file ID matches canonical ID');

    // Clean up test file
    if (fs.existsSync(mockStoragePath)) fs.unlinkSync(mockStoragePath);

  } catch (err) {
    console.error('🔴 Executor Test Error:', err);
    failed++;
  } finally {
    console.log('\n======================================================');
    console.log(`📊 EXECUTOR TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
