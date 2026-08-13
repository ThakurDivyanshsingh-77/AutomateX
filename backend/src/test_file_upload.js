import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const request = require('supertest');
import './env.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import express from 'express';
import app from './app.js';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { FileModel } from './models/File.js';
import { Workflow } from './models/Workflow.js';
import { executorRegistry } from './engine/ExecutorRegistry.js';
import { ExecutionContext } from './engine/ExecutionContext.js';

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
  console.log('🧪 AUTOMATEX FILE UPLOAD & STORAGE ENGINE TEST SUITE');
  console.log('======================================================\n');

  try {
    await connectDB();

    // 1. Create Test Users
    const testUserAId = new mongoose.Types.ObjectId();
    const testUserBId = new mongoose.Types.ObjectId();

    await User.deleteMany({ email: { $in: ['test_user_a@automatex.com', 'test_user_b@automatex.com'] } });

    const userA = await User.create({
      _id: testUserAId,
      name: 'User A',
      email: 'test_user_a@automatex.com',
      password: 'password123',
    });

    const userB = await User.create({
      _id: testUserBId,
      name: 'User B',
      email: 'test_user_b@automatex.com',
      password: 'password123',
    });

    const jwtSecret = process.env.JWT_SECRET || 'workflow_platform_super_secret_key_2026';
    const tokenA = jwt.sign({ id: userA._id.toString() }, jwtSecret, { expiresIn: '1h' });
    const tokenB = jwt.sign({ id: userB._id.toString() }, jwtSecret, { expiresIn: '1h' });

    console.log('1️⃣ TESTING AUTHENTICATED FILE UPLOADS');

    // Test 1: Upload valid DOCX file
    const docxBuffer = Buffer.from('Mock DOCX binary content for product import testing', 'utf-8');
    const resDocx = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${tokenA}`)
      .attach('file', docxBuffer, 'products.docx');

    assert(resDocx.status === 200, 'DOCX upload returns HTTP 200 status');
    assert(resDocx.body.success === true, 'DOCX upload response payload success === true');
    assert(resDocx.body.file?.id?.startsWith('file_'), 'DOCX file ID has file_ prefix');
    assert(resDocx.body.file?.extension === '.docx', 'DOCX extension is .docx');
    assert(resDocx.body.file?.name === 'products.docx', 'DOCX original filename matches');

    const fileIdA = resDocx.body.file?.id;

    // Test 2: Upload valid PDF file
    const pdfBuffer = Buffer.from('%PDF-1.4 Mock PDF content', 'utf-8');
    const resPdf = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${tokenA}`)
      .attach('file', pdfBuffer, 'catalog.pdf');

    assert(resPdf.status === 200, 'PDF upload returns HTTP 200 status');
    assert(resPdf.body.file?.extension === '.pdf', 'PDF extension is .pdf');

    // Test 3: Upload valid XLSX file
    const xlsxBuffer = Buffer.from('Mock XLSX spreadsheet binary data', 'utf-8');
    const resXlsx = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${tokenA}`)
      .attach('file', xlsxBuffer, 'inventory.xlsx');

    assert(resXlsx.status === 200, 'XLSX upload returns HTTP 200 status');
    assert(resXlsx.body.file?.extension === '.xlsx', 'XLSX extension is .xlsx');

    console.log('\n2️⃣ TESTING SECURITY & INPUT VALIDATIONS');

    // Test 4: Reject unsupported extension (.exe)
    const exeBuffer = Buffer.from('MZ executable binary code', 'utf-8');
    const resExe = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${tokenA}`)
      .attach('file', exeBuffer, 'malicious_script.exe');

    assert(resExe.status === 400, 'Unsupported extension (.exe) returns HTTP 400 error');
    assert(resExe.body.success === false, 'Rejected payload success === false');
    assert(resExe.body.error?.code === 'UNSUPPORTED_FILE_TYPE', 'Error code is UNSUPPORTED_FILE_TYPE');

    // Test 5: Reject unauthenticated upload
    const resUnauth = await request(app)
      .post('/api/v1/files/upload')
      .attach('file', docxBuffer, 'products.docx');

    assert(resUnauth.status === 401, 'Unauthenticated upload request returns HTTP 401 Unauthorized');

    // Test 6: User Isolation Guard (User B fetching User A\'s uploaded file)
    const resGetIso = await request(app)
      .get(`/api/v1/files/${fileIdA}`)
      .set('Authorization', `Bearer ${tokenB}`);

    assert(resGetIso.status === 403, 'User B accessing User A\'s file returns HTTP 403 Forbidden');
    assert(resGetIso.body.error?.code === 'UNAUTHORIZED_ACCESS', 'Error code is UNAUTHORIZED_ACCESS');

    // Test 7: User A successfully fetching own file metadata
    const resGetOwn = await request(app)
      .get(`/api/v1/files/${fileIdA}`)
      .set('Authorization', `Bearer ${tokenA}`);

    assert(resGetOwn.status === 200, 'User A fetching own file returns HTTP 200 status');
    assert(resGetOwn.body.file?.id === fileIdA, 'File ID in response matches User A\'s uploaded file');

    console.log('\n3️⃣ TESTING WORKFLOW PERSISTENCE & EXECUTION ENGINE');

    // Test 8: Save Workflow with uploaded file config
    await Workflow.deleteMany({ title: 'Product Import Test Workflow' });

    const workflowDoc = await Workflow.create({
      title: 'Product Import Test Workflow',
      userId: userA._id,
      nodes: [
        {
          id: 'node_upload_doc',
          type: 'fileUpload',
          data: {
            label: 'Upload Document',
            config: {
              fileId: fileIdA,
              file: resDocx.body.file,
            },
          },
        },
      ],
      edges: [],
      status: 'active',
    });

    assert(workflowDoc && workflowDoc._id, 'Workflow saved with fileUpload node reference');

    // Test 9: Reload Workflow from DB & verify configuration integrity
    const reloadedWorkflow = await Workflow.findById(workflowDoc._id);
    const nodeConfig = reloadedWorkflow.nodes[0]?.data?.config;

    assert(nodeConfig?.fileId === fileIdA, 'Reloaded workflow preserves fileId reference');
    assert(nodeConfig?.file?.name === 'products.docx', 'Reloaded workflow preserves file metadata name');

    // Test 10: Execute FileUploadExecutor
    const executor = executorRegistry.getExecutor('fileUpload');
    const context = new ExecutionContext();

    const nodePayload = {
      id: 'node_upload_doc',
      type: 'fileUpload',
      data: {
        config: {
          fileId: fileIdA,
          file: resDocx.body.file,
        },
      },
    };

    const executionOutput = await executor.execute(nodePayload, context);

    assert(executionOutput.success === true, 'FileUploadExecutor execution result success === true');
    assert(executionOutput.file?.id === fileIdA, 'Execution output contains correct file.id');
    assert(executionOutput.file?.name === 'products.docx', 'Execution output contains correct file.name');
    assert(executionOutput.file?.extension === '.docx', 'Execution output contains correct file.extension');
    assert(executionOutput.file?.status === 'uploaded', 'Execution output contains correct file.status');

    console.log('\n4️⃣ TESTING FILE DELETION & CLEANUP');

    // Test 11: User B attempting to delete User A\'s file
    const resDelIso = await request(app)
      .delete(`/api/v1/files/${fileIdA}`)
      .set('Authorization', `Bearer ${tokenB}`);

    assert(resDelIso.status === 403, 'User B deleting User A\'s file returns HTTP 403 Forbidden');

    // Test 12: User A deleting own file
    const resDelOwn = await request(app)
      .delete(`/api/v1/files/${fileIdA}`)
      .set('Authorization', `Bearer ${tokenA}`);

    assert(resDelOwn.status === 200, 'User A deleting own file returns HTTP 200 status');
    assert(resDelOwn.body.success === true, 'Deletion response success === true');

    const dbCheck = await FileModel.findOne({ id: fileIdA });
    assert(dbCheck === null, 'File record successfully removed from MongoDB collection');

    // Cleanup Test Users & Workflows
    await User.deleteMany({ email: { $in: ['test_user_a@automatex.com', 'test_user_b@automatex.com'] } });
    await Workflow.deleteMany({ title: 'Product Import Test Workflow' });

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
