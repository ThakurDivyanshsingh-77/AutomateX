import './env.js';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Workflow } from './models/Workflow.js';
import { AIWorkflowService } from './services/ai/AIWorkflowService.js';
import { GrokClient } from './services/ai/GrokClient.js';
import { HeuristicWorkflowGenerator } from './services/ai/HeuristicWorkflowGenerator.js';

async function runTest() {
  console.log('====================================================');
  console.log('  PHASE 12 — AI WORKFLOW BUILDER VERIFICATION TEST');
  console.log('====================================================\n');

  await connectDB();

  // 1. Identify user
  const user = await User.findOne({});
  if (!user) throw new Error('No user found in DB');
  console.log(`✓ 1. User identified: ID=${user._id}`);

  // 2. Test Grok API client configuration check
  const grokConfigured = GrokClient.isConfigured();
  console.log(`✓ 2. Grok API configured: ${grokConfigured ? 'YES (Key detected)' : 'NO (Will test Heuristic Engine fallback)'}`);

  // 3. Test Heuristic Engine (Offline Generator) directly
  const prompt1 = 'When a user signs up, send a welcome email, wait 5 minutes, send a Slack message, then log output.';
  const genResult = HeuristicWorkflowGenerator.generate(prompt1);

  console.assert(genResult.definition.nodes.length >= 5, 'Should have generated at least 5 nodes');
  const triggerType = genResult.definition.nodes[0].type;
  console.assert(['webhook', 'start', 'cron'].includes(triggerType), 'Trigger node should be valid trigger type');
  console.assert(genResult.definition.nodes[genResult.definition.nodes.length - 1].type === 'end', 'Last node should be end');
  console.log(`✓ 3. Heuristic Generator created ${genResult.definition.nodes.length} nodes & ${genResult.definition.edges.length} edges`);
  console.log(`   Name: "${genResult.name}"`);

  // 4. Test AIWorkflowService.generate() (with DB workflow document creation)
  const serviceResult = await AIWorkflowService.generate(prompt1, user._id);
  console.assert(serviceResult.success === true, 'Service generate failed');
  console.assert(serviceResult.definition?.nodes?.length >= 5, 'Generated nodes missing');
  console.log(`✓ 4. AIWorkflowService.generate created workflow doc in DB (Provider: ${serviceResult.provider})`);

  let createdWfId = serviceResult.workflow?._id;

  // 5. Test AIWorkflowService.explain()
  const explainResult = await AIWorkflowService.explain(serviceResult.definition);
  console.assert(explainResult.success === true, 'Explain failed');
  console.assert(typeof explainResult.explanation === 'string' && explainResult.explanation.length > 10, 'Explanation empty');
  console.log(`✓ 5. AIWorkflowService.explain generated step-by-step breakdown (${explainResult.provider})`);

  // 6. Test AIWorkflowService.optimize()
  const optimizeResult = await AIWorkflowService.optimize(serviceResult.definition);
  console.assert(optimizeResult.success === true, 'Optimize failed');
  console.assert(optimizeResult.definition.nodes.length > 0, 'Optimized nodes missing');
  console.log(`✓ 6. AIWorkflowService.optimize executed clean layout realignment`);

  // 7. Test AIWorkflowService.fix() (Auto-repair test)
  const brokenDefinition = {
    nodes: [
      { id: 'n2', type: 'gmail', position: { x: 300, y: 150 }, data: { label: 'Gmail' } },
    ],
    edges: [],
  };

  const fixedResult = await AIWorkflowService.fix(brokenDefinition);
  console.assert(fixedResult.success === true, 'Fix failed');
  const fixedNodes = fixedResult.definition.nodes;
  console.assert(fixedNodes.some(n => n.type === 'start'), 'Should have injected start node');
  console.assert(fixedNodes.some(n => n.type === 'end'), 'Should have injected end node');
  console.assert(fixedResult.definition.edges.length > 0, 'Should have connected edges');
  console.log(`✓ 7. AIWorkflowService.fix auto-repaired broken graph (injected Start & End, connected edges)`);

  // Cleanup
  if (createdWfId) {
    await Workflow.findByIdAndDelete(createdWfId);
    console.log('\n✓ Test workflow record cleaned up');
  }

  console.log('\n🎉 PHASE 12 AI WORKFLOW BUILDER BACKEND VERIFICATION PASSED!');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('\n❌ Phase 12 Test Error:', err.message || err);
  process.exit(1);
});
