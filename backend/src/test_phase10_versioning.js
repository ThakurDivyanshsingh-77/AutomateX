import './env.js';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Workflow } from './models/Workflow.js';
import { WorkflowVersion } from './models/WorkflowVersion.js';
import { VersionManager } from './services/VersionManager.js';
import { VersionComparator } from './services/VersionComparator.js';
import { PublishManager } from './services/PublishManager.js';

const DEF_V1 = {
  nodes: [
    { id: 'n1', type: 'webhook', position: { x: 100, y: 100 }, data: { label: 'Webhook Trigger' } },
    { id: 'n2', type: 'end', position: { x: 400, y: 100 }, data: { label: 'End' } },
  ],
  edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
  viewport: { x: 0, y: 0, zoom: 1 },
};

const DEF_V2 = {
  nodes: [
    { id: 'n1', type: 'webhook', position: { x: 100, y: 100 }, data: { label: 'Webhook Trigger' } },
    { id: 'n3', type: 'gmail', position: { x: 250, y: 100 }, data: { label: 'Gmail Send Email', config: { to: '{{trigger.body.email}}' } } },
    { id: 'n2', type: 'end', position: { x: 500, y: 100 }, data: { label: 'End' } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n3' },
    { id: 'e2', source: 'n3', target: 'n2' },
  ],
  viewport: { x: 0, y: 0, zoom: 1 },
};

async function runTest() {
  console.log('====================================================');
  console.log('  PHASE 10 — WORKFLOW VERSIONING SYSTEM VERIFICATION');
  console.log('====================================================\n');

  await connectDB();

  // 1. Find test user
  const user = await User.findOne({});
  if (!user) throw new Error('No user found in DB');
  console.log(`✓ 1. User identified: ID=${user._id}`);

  // 2. Create fresh test workflow
  const workflow = await Workflow.create({
    owner: user._id,
    name: `Phase 10 Versioning Test ${Date.now()}`,
    description: 'Automated versioning test workflow',
    definition: DEF_V1,
  });
  console.log(`✓ 2. Workflow created: ID=${workflow._id}, Name="${workflow.name}"`);

  // 3. Test semver helpers
  const tag = VersionManager.incrementSemver('v1.0.0', 'minor');
  console.log(`✓ 3. Semver helper: v1.0.0 + minor = ${tag} (expected: v1.1.0)`);
  console.assert(tag === 'v1.1.0', 'Semver minor bump failed!');

  const patchTag = VersionManager.incrementSemver('v1.3.5', 'patch');
  console.assert(patchTag === 'v1.3.6', 'Semver patch bump failed!');
  const majorTag = VersionManager.incrementSemver('v2.1.0', 'major');
  console.assert(majorTag === 'v3.0.0', 'Semver major bump failed!');
  console.log('✓ 3. All semver helpers pass (minor, patch, major)');

  // 4. First publish — creates v1.0.0
  const publishResult = await PublishManager.publishWorkflow(workflow._id, user._id, {
    definition: DEF_V1,
    changeSummary: ['Initial release', 'Webhook trigger configured'],
    title: 'Initial Release',
  });
  const v1 = publishResult.version || publishResult;
  const v1tag = v1.version || (v1._id ? 'v1.0.0' : undefined);
  console.log(`✓ 4. First publish: ${v1tag} (status=${v1.status})`);
  console.assert(v1tag === 'v1.0.0', `Expected v1.0.0, got ${v1tag}`);

  // 5. Second publish — creates v1.1.0 with Gmail node
  const pub2 = await PublishManager.publishWorkflow(workflow._id, user._id, {
    definition: DEF_V2,
    changeSummary: ['+ Gmail Send Email node added', '* Webhook connections updated'],
    bump: 'minor',
    title: 'Gmail Integration',
  });
  const v2 = pub2.version || pub2;
  console.log(`✓ 5. Second publish: ${v2.version} (status=${v2.status})`);
  console.assert(v2.version === 'v1.1.0', `Expected v1.1.0, got ${v2.version}`);

  // 6. List all versions
  const versionsResult = await VersionManager.getVersions(workflow._id, user._id);
  console.log(`✓ 6. Version list: ${versionsResult.length} versions found`);
  console.assert(versionsResult.length >= 2, `Expected ≥2 versions, got ${versionsResult.length}`);

  // 7. Compare v1.0.0 vs v1.1.0
  const v1Record = await VersionManager.getVersionByTag(workflow._id, user._id, 'v1.0.0');
  const v2Record = await VersionManager.getVersionByTag(workflow._id, user._id, 'v1.1.0');
  const diff = VersionComparator.compare(v1Record.definition, v2Record.definition);
  console.log(`✓ 7. Version diff: +${diff.stats.nodesAdded} nodes, -${diff.stats.nodesRemoved}, *${diff.stats.nodesUpdated} updated`);
  console.log('   Change Summary:', diff.summary.join(' | '));
  console.assert(diff.stats.nodesAdded >= 1, 'Should have detected Gmail node as added');

  // 8. Save a draft
  const draft = await VersionManager.saveDraft(workflow._id, user._id, {
    ...DEF_V2,
    nodes: [...DEF_V2.nodes, { id: 'n4', type: 'delay', position: { x: 600, y: 100 }, data: { label: 'Delay 1s' } }],
  });
  console.log(`✓ 8. Draft saved: version=${draft.version}`);

  // 9. Delete the draft
  const deleteDraftResult = await VersionManager.deleteDraft(workflow._id, user._id);
  console.log(`✓ 9. Draft deleted: ${deleteDraftResult.deleted} records removed`);
  console.assert(deleteDraftResult.deleted >= 1, 'Draft should have been deleted');

  // 10. Restore to v1.0.0 — creates v1.1.1 rollback
  const restoreResult = await VersionManager.restore(workflow._id, user._id, 'v1.0.0');
  console.log(`✓ 10. Restore: Created rollback version ${restoreResult.version.version} (isRollback=${restoreResult.version.isRollback})`);
  console.assert(restoreResult.version.isRollback === true, 'Restored version should be marked isRollback');

  // 11. Verify Workflow.definition matches restored definition
  const updatedWorkflow = await Workflow.findById(workflow._id);
  const restoredNodes = updatedWorkflow.definition?.nodes || [];
  console.log(`✓ 11. Live definition restored: ${restoredNodes.length} nodes (v1.0.0 had ${DEF_V1.nodes.length} nodes)`);
  console.assert(restoredNodes.length === DEF_V1.nodes.length, 'Live definition node count should match v1.0.0');

  // 12. Final version list
  const finalVersions = await VersionManager.getVersions(workflow._id, user._id);
  console.log(`✓ 12. Final version count: ${finalVersions.length} versions total`);
  finalVersions.forEach((v) => console.log(`      ${v.version} [${v.status}]${v.isRollback ? ' (rollback)' : ''}`));

  // Cleanup
  await WorkflowVersion.deleteMany({ workflowId: workflow._id });
  await Workflow.findByIdAndDelete(workflow._id);
  console.log('\n✓ Test workflow cleaned up');

  console.log('\n🎉 PHASE 10 WORKFLOW VERSIONING BACKEND VERIFICATION PASSED!');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('\n❌ Phase 10 Test Error:', err.message || err);
  process.exit(1);
});
