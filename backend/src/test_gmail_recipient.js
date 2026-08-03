import './env.js';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Credential } from './credentials/Credential.js';
import { Workflow } from './models/Workflow.js';
import { WebhookService } from './webhooks/WebhookService.js';
import { WorkflowEngine } from './engine/WorkflowEngine.js';

async function runTest() {
  console.log('====================================================');
  console.log(' STARTING DYNAMIC GMAIL RECIPIENT RESOLUTION TEST');
  console.log('====================================================\n');

  await connectDB();

  // 1. Identify User
  const user = await User.findOne({});
  if (!user) throw new Error('No user found in database');

  // 2. Identify Gmail Credential
  const credential = await Credential.findOne({ service: 'gmail', owner: user._id });
  if (!credential) throw new Error('No Gmail credential found for user');

  // 3. Create or Update Test Workflow
  const workflow = await Workflow.create({
    name: 'Dynamic Gmail Recipient E2E Test',
    owner: user._id,
    status: 'published',
    webhookToken: 'test-recipient-token',
    customPath: 'test-recipient-trigger',
    definition: {
      nodes: [
        {
          id: 'node_webhook_1',
          type: 'webhook',
          data: {
            label: 'Webhook Trigger',
            config: { path: 'test-recipient-trigger', method: 'POST', authType: 'none' },
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
              subject: 'Welcome {{trigger.body.name}} to AutomateX!',
              body: 'Hello {{trigger.body.name}},\n\nYour signup email is {{trigger.body.email}}.\n\nBest regards,\nAutomateX Team',
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

  // 4. Send Webhook Payload with Alice recipient
  const reqPayload = {
    method: 'POST',
    body: {
      event: 'signup',
      name: 'Alice',
      email: 'alice@example.com',
    },
    headers: { 'content-type': 'application/json' },
    query: {},
    ip: '127.0.0.1',
  };

  console.log('Sending Webhook Payload:');
  console.dir(reqPayload.body, { depth: null });

  const webhookRes = await WebhookService.processRequest(reqPayload, workflow._id.toString());
  console.log('\nWebhook Result:', webhookRes);

  console.log('\nExecuting Workflow Engine...');
  const executionResult = await WorkflowEngine.run(
    workflow.definition,
    webhookRes.executionId,
    webhookRes.triggerPayload
  );

  console.log('\n====================================================');
  console.log(' EXECUTION SUMMARY & VERIFICATION RESULTS');
  console.log('====================================================');
  console.log('Engine Status:', executionResult.status);

  const gmailNodeLog = executionResult.logs?.find((l) => l.nodeId === 'node_gmail_1');
  console.log('\nGmail Node Step Output:');
  console.dir(gmailNodeLog?.output, { depth: null });

  if (gmailNodeLog?.output?.recipient === 'alice@example.com') {
    console.log('\n🎉 SUCCESS: Gmail Recipient resolved dynamically to "alice@example.com"!');
  } else {
    console.error('\n❌ FAILURE: Gmail Recipient did NOT resolve to "alice@example.com"');
    process.exit(1);
  }

  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
