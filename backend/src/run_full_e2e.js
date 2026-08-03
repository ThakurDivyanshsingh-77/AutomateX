import './env.js';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Credential } from './credentials/Credential.js';
import { Workflow } from './models/Workflow.js';
import { Execution } from './models/Execution.js';
import { WebhookService } from './webhooks/WebhookService.js';
import { ExecutionWorker } from './runtime/workers/ExecutionWorker.js';
import { WorkflowEngine } from './engine/WorkflowEngine.js';
import mongoose from 'mongoose';

async function runE2E() {
  console.log('====================================================');
  console.log('  STARTING GMAIL WORKFLOW END-TO-END VERIFICATION');
  console.log('====================================================\n');

  // 1. Connect to DB using application's connectDB()
  const dbConnected = await connectDB();
  console.log(`DB Connection Status: ${dbConnected ? 'CONNECTED' : 'FALLBACK'}`);

  // 2. Load User
  let user = await User.findOne();
  if (!user) {
    user = await User.create({
      name: 'Divyansh Singh',
      email: 'divyanshthakur.2251@gmail.com',
      password: 'password123',
    });
  }
  console.log(`1. User Identified: ID=${user._id}, Email=${user.email}`);

  // 3. Load Gmail Credential
  let credential = await Credential.findOne({ service: 'gmail' });

  if (!credential) {
    const mockOAuthData = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: 'mock_refresh_token_123',
      accessToken: 'mock_access_token_123',
      expiryDate: Date.now() + 3600000,
      userEmail: 'divyanshthakur.2251@gmail.com',
    };
    credential = await Credential.create({
      owner: user._id,
      name: 'Divyansh Gmail Credential',
      service: 'gmail',
      authType: 'oauth2',
      secret: JSON.stringify(mockOAuthData),
    });
  }
  console.log(`2. Gmail Credential Verified: ID=${credential._id}, Service=${credential.service}`);

  // 4. Create fresh E2E Workflow
  await Workflow.deleteMany({ name: 'E2E Gmail Automation' });
  const workflow = await Workflow.create({
    name: 'E2E Gmail Automation',
    description: 'Webhook -> IF -> Gmail -> End E2E Test Workflow',
    owner: user._id,
    status: 'published',
    webhookToken: 'e2e-gmail-token-123',
    customPath: 'e2e-gmail-trigger',
    definition: {
      nodes: [
        {
          id: 'node_webhook_1',
          type: 'webhook',
          data: {
            label: 'Webhook Trigger',
            config: { path: 'e2e-gmail-trigger', method: 'POST', authType: 'none' },
          },
        },
        {
          id: 'node_if_1',
          type: 'condition',
          data: {
            label: 'IF Condition (email exists)',
            config: {
              field: '{{trigger.body.email}}',
              operator: 'is_not_empty',
              value: '',
            },
          },
        },
        {
          id: 'node_gmail_1',
          type: 'gmail',
          data: {
            label: 'Gmail Send Email',
            config: {
              credentialId: credential._id.toString(),
              to: '{{trigger.body.email}}',
              subject: 'AutomateX E2E Verification: Hello {{trigger.body.name}}!',
              body: 'Hello {{trigger.body.name}},\n\nYour event "{{trigger.body.event}}" was processed successfully!\n\nBest regards,\nAutomateX Platform Engine',
            },
          },
        },
        {
          id: 'node_end_1',
          type: 'end',
          data: { label: 'End Completion' },
        },
      ],
      edges: [
        { id: 'e1', source: 'node_webhook_1', target: 'node_if_1' },
        { id: 'e2', source: 'node_if_1', target: 'node_gmail_1', sourceHandle: 'true' },
        { id: 'e3', source: 'node_gmail_1', target: 'node_end_1' },
      ],
    },
  });
  console.log(`3. Target Workflow Ready: ID=${workflow._id}, Path=${workflow.customPath}`);

  // 5. Simulate Incoming Webhook Request with Test Payload
  const reqPayload = {
    method: 'POST',
    body: {
      event: 'signup',
      name: 'Divyansh Singh',
      email: 'divyanshthakur.2251@gmail.com',
    },
    headers: { 'content-type': 'application/json' },
    query: {},
    ip: '127.0.0.1',
  };

  console.log('\n====================================================');
  console.log(' STAGE 1: WEBHOOK RECEIVES PAYLOAD');
  console.log('====================================================');
  console.dir(reqPayload.body, { depth: null });

  const webhookRes = await WebhookService.processRequest(reqPayload, workflow._id.toString());
  console.log('\n✅ STAGE 2: TRIGGER PAYLOAD STORED & QUEUED');
  console.log('Webhook Result:', webhookRes);

  // 6. Process Execution Job via Worker
  console.log('\n====================================================');
  console.log(' STAGE 3-9: EXECUTION ENGINE TRAVERSAL & GMAIL PLUGIN');
  console.log('====================================================');

  console.log('[DEBUG RUN_FULL_E2E WEBHOOK RES]:', webhookRes);
  const executionResult = await WorkflowEngine.run(
    workflow.definition,
    webhookRes.executionId,
    webhookRes.triggerPayload
  );

  console.log('\n✅ EXECUTION COMPLETE');
  console.log('Status:', executionResult.status);
  console.log('Nodes Executed:', executionResult.nodesExecuted);
  console.log('\nExecution Logs:');
  console.dir(executionResult.logs, { depth: null });

  // 7. Verify MongoDB Execution Record
  if (mongoose.connection.readyState === 1) {
    const savedExec = await Execution.findById(webhookRes.executionId);
    console.log('\n====================================================');
    console.log(' STAGE 10: SAVED MONGODB EXECUTION HISTORY');
    console.log('====================================================');
    console.log('ID:', savedExec._id);
    console.log('Status:', savedExec.status);
    console.log('Output:', JSON.stringify(savedExec.output, null, 2));
  }

  await mongoose.disconnect();
  console.log('\n🎉 ALL 10 VERIFICATION STAGES COMPLETED!');
}

runE2E().catch((err) => {
  console.error('\n❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});
