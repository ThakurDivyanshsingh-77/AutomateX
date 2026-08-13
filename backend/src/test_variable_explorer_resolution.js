import './env.js';
import { ExpressionResolver } from './engine/expression/ExpressionResolver.js';

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
  console.log('🧪 AUTOMATEX VARIABLE EXPLORER & RESOLUTION TEST SUITE');
  console.log('======================================================\n');

  try {
    // Mock execution context nodeOutputs map
    const nodeOutputs = new Map();

    // 1. Step output from File -> Upload Document node
    nodeOutputs.set('File → Upload Document', {
      success: true,
      file: {
        id: 'file_cf1c4cd42ee4ed57dfbd47db',
        name: 'catalog.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 245678,
        extension: '.docx',
        status: 'uploaded',
      },
      fileId: 'file_cf1c4cd42ee4ed57dfbd47db',
      fileName: 'catalog.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 245678,
    });

    // 2. Step output from Document -> Extract Content node
    nodeOutputs.set('Document → Extract Content', {
      success: true,
      file: {
        id: 'file_cf1c4cd42ee4ed57dfbd47db',
        name: 'catalog.docx',
      },
      content: {
        text: 'Nike Air Max - Running shoes - $5999',
        paragraphs: [
          { index: 0, text: 'Product Name: Nike Air Max' },
          { index: 1, text: 'Price: 5999' },
        ],
        headings: [{ level: 1, text: 'Products Catalog' }],
        tables: [
          {
            headers: ['Product Name', 'Description', 'Price'],
            rows: [['Nike Air Max', 'Running shoes', '5999']],
          },
        ],
        blocks: [{ type: 'paragraph', text: 'Product Name: Nike Air Max' }],
      },
      stats: {
        characters: 181,
        paragraphs: 5,
        headings: 1,
        tables: 1,
        blocks: 6,
      },
    });

    const context = {
      nodeOutputs,
      executionId: 'exec_test_var_001',
      workflowId: 'wf_test_001',
    };

    console.log('1️⃣ TESTING EXPRESSION RESOLUTION FOR FILE UPLOAD NODE OUTPUTS');

    const resFileId = ExpressionResolver.resolveExpression('steps["File → Upload Document"].file.id', context);
    assert(resFileId === 'file_cf1c4cd42ee4ed57dfbd47db', 'Resolved steps["File → Upload Document"].file.id');

    const resFileIdShortcut = ExpressionResolver.resolveExpression('steps["File → Upload Document"].fileId', context);
    assert(resFileIdShortcut === 'file_cf1c4cd42ee4ed57dfbd47db', 'Resolved steps["File → Upload Document"].fileId');

    const resFileName = ExpressionResolver.resolveExpression('steps["File → Upload Document"].file.name', context);
    assert(resFileName === 'catalog.docx', 'Resolved steps["File → Upload Document"].file.name');

    const resMimeType = ExpressionResolver.resolveExpression('steps["File → Upload Document"].mimeType', context);
    assert(resMimeType.includes('wordprocessingml'), 'Resolved steps["File → Upload Document"].mimeType');

    console.log('\n2️⃣ TESTING EXPRESSION RESOLUTION FOR DOCUMENT EXTRACT NODE OUTPUTS');

    const resDocText = ExpressionResolver.resolveExpression('steps["Document → Extract Content"].content.text', context);
    assert(resDocText.includes('Nike Air Max'), 'Resolved steps["Document → Extract Content"].content.text');

    const resTableRows = ExpressionResolver.resolveExpression('steps["Document → Extract Content"].content.tables[0].rows[0][0]', context);
    assert(resTableRows === 'Nike Air Max', 'Resolved steps["Document → Extract Content"].content.tables[0].rows[0][0]');

    const resStatsChars = ExpressionResolver.resolveExpression('steps["Document → Extract Content"].stats.characters', context);
    assert(resStatsChars === 181, 'Resolved steps["Document → Extract Content"].stats.characters');

    console.log('\n3️⃣ TESTING SYSTEM & FUNCTION EXPRESSION RESOLUTION');

    const resExecId = ExpressionResolver.resolveExpression('$execution.id', context);
    assert(resExecId === 'exec_test_var_001', 'Resolved $execution.id system variable');

    const resUpperText = ExpressionResolver.resolveExpression('upper(steps["File → Upload Document"].file.name)', context);
    assert(resUpperText === 'CATALOG.DOCX', 'Resolved upper(steps["File → Upload Document"].file.name)');

    const resLengthText = ExpressionResolver.resolveExpression('length(steps["File → Upload Document"].fileName)', context);
    assert(resLengthText === 12, 'Resolved length(steps["File → Upload Document"].fileName)');

  } catch (err) {
    console.error('🔴 Test execution error:', err);
    failed++;
  } finally {
    console.log('\n======================================================');
    console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
