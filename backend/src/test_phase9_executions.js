import './env.js';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Workflow } from './models/Workflow.js';
import { Execution } from './models/Execution.js';
import { ExecutionLogger } from './services/ExecutionLogger.js';
import { executionService } from './services/executionService.js';

async function runPhase9Test() {
  console.log('====================================================');
  console.log('  STARTING PHASE 9 EXECUTION HISTORY VERIFICATION');
  console.log('====================================================\n');

  await connectDB();

  // 1. Identify User
  const user = await User.findOne({});
  if (!user) throw new Error('No user found');

  // 2. Identify or Create Workflow
  let workflow = await Workflow.findOne({ owner: user._id });
  if (!workflow) {
    workflow = await Workflow.create({
      name: 'Phase 9 Audit Workflow',
      owner: user._id,
      status: 'published',
    });
  }

  console.log(`1. User identified: ID=${user._id}`);
  console.log(`2. Workflow identified: ID=${workflow._id}, Name="${workflow.name}"`);

  // 3. Test ExecutionLogger: Start execution
  const execution = await ExecutionLogger.startExecution({
    workflowId: workflow._id,
    ownerId: user._id,
    triggerType: 'webhook',
    triggerPayload: { event: 'user_signup', email: 'test@phase9.com' },
  });

  console.log(`\n3. Started Execution Record: ID=${execution._id}`);

  // 4. Test ExecutionLogger: Log Node Steps
  await ExecutionLogger.logStep(execution._id, {
    nodeId: 'node_webhook_1',
    nodeName: 'Webhook Trigger',
    nodeType: 'webhook',
    status: 'success',
    duration: 12,
    input: { event: 'user_signup', email: 'test@phase9.com' },
    output: { body: { email: 'test@phase9.com' } },
  });

  await ExecutionLogger.logStep(execution._id, {
    nodeId: 'node_gmail_1',
    nodeName: 'Gmail Send Email',
    nodeType: 'gmail',
    status: 'success',
    duration: 245,
    input: { to: 'test@phase9.com' },
    output: { status: 'SENT', messageId: 'msg_phase9_test' },
  });

  // 5. Test ExecutionLogger: Finish execution
  const finishedExecution = await ExecutionLogger.finishExecution(execution._id, {
    status: 'success',
    output: { completed: true, messageId: 'msg_phase9_test' },
  });

  console.log(`\n4. Execution Finished: Status=${finishedExecution.status}, Duration=${finishedExecution.duration}ms, Steps=${finishedExecution.nodesExecuted}`);

  // 6. Test Stats API Service
  const stats = await executionService.getExecutionStats(user._id.toString());
  console.log('\n5. Execution Stats Summary:', stats);

  // 7. Test Paginated & Filtered Executions List
  const list = await executionService.getUserExecutions(user._id.toString(), {
    page: 1,
    limit: 10,
    status: 'success',
    triggerType: 'webhook',
  });

  console.log(`\n6. Paginated Search/Filter Results: Count=${list.executions?.length}, Total=${list.total}, Pages=${list.pages}`);

  // 8. Test Get Single Execution By ID (with populated step details)
  const single = await executionService.getExecutionById(user._id.toString(), execution._id.toString());
  console.log(`\n7. Single Execution Details Fetched: ID=${single._id}, StepCount=${single.stepDetails?.length}`);

  if (single && single.stepDetails?.length >= 2) {
    console.log('\n🎉 PHASE 9 EXECUTION HISTORY BACKEND VERIFICATION PASSED!');
    process.exit(0);
  } else {
    console.error('\n❌ PHASE 9 VERIFICATION FAILED: Step details missing');
    process.exit(1);
  }
}

runPhase9Test().catch((err) => {
  console.error('Phase 9 Test Error:', err);
  process.exit(1);
});
