import { Workflow } from '../models/Workflow.js';
import { WorkflowVersion } from '../models/WorkflowVersion.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Parse a semver string like "v1.2.3" into { major, minor, patch }
 */
function parseSemver(tag) {
  const clean = (tag || 'v1.0.0').replace(/^v/, '');
  const [major = 1, minor = 0, patch = 0] = clean.split('.').map(Number);
  return { major, minor, patch };
}

/**
 * Serialize { major, minor, patch } back to a semver string "vX.Y.Z"
 */
function formatSemver({ major, minor, patch }) {
  return `v${major}.${minor}.${patch}`;
}

/**
 * Increment a semver object by the given bump type ('major' | 'minor' | 'patch')
 */
function incrementSemver(current, bump = 'minor') {
  const { major, minor, patch } = parseSemver(current);
  if (bump === 'major') return formatSemver({ major: major + 1, minor: 0, patch: 0 });
  if (bump === 'patch') return formatSemver({ major, minor, patch: patch + 1 });
  // Default: minor bump
  return formatSemver({ major, minor: minor + 1, patch: 0 });
}

// ─── VersionManager ───────────────────────────────────────────────────────────

export class VersionManager {
  /**
   * Create the initial v1.0.0 version when a workflow is first published.
   * Should only be called once per workflow.
   */
  static async createInitialVersion(workflowId, ownerId, definition, { title = 'Initial Release', description = '', changeSummary = [] } = {}) {
    const existing = await WorkflowVersion.findOne({ workflowId });
    if (existing) return existing; // Already initialized

    const versionTag = 'v1.0.0';
    const versionNumber = parseSemver(versionTag);

    const versionRecord = await WorkflowVersion.create({
      workflowId,
      version: versionTag,
      versionNumber,
      title,
      description,
      definition: definition || { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
      createdBy: ownerId,
      status: 'published',
      parentVersion: null,
      changeSummary: changeSummary.length > 0 ? changeSummary : ['Initial release'],
      publishedAt: new Date(),
    });

    await Workflow.findByIdAndUpdate(workflowId, {
      $set: {
        currentVersion: versionTag,
        publishedVersion: versionTag,
        lastPublishedAt: new Date(),
        totalVersions: 1,
      },
    });

    return versionRecord;
  }

  /**
   * Save (upsert) a draft version.
   * A workflow can only have one draft at a time.
   * Draft is stored in WorkflowVersion with status: 'draft'.
   */
  static async saveDraft(workflowId, ownerId, definition) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: ownerId });
    if (!workflow) throw new Error('Workflow not found or access denied');

    const currentPublishedTag = workflow.publishedVersion || 'v1.0.0';
    const draftTag = workflow.draftVersion || `${currentPublishedTag}-draft`;

    // Upsert the draft record
    const draft = await WorkflowVersion.findOneAndUpdate(
      { workflowId, status: 'draft' },
      {
        $set: {
          workflowId,
          version: draftTag,
          versionNumber: parseSemver(currentPublishedTag),
          definition,
          createdBy: ownerId,
          status: 'draft',
          parentVersion: currentPublishedTag,
        },
      },
      { upsert: true, new: true }
    );

    await Workflow.findByIdAndUpdate(workflowId, {
      $set: { draftVersion: draftTag },
    });

    return draft;
  }

  /**
   * Publish a new version.
   * Snapshots current definition into a new semver version.
   * Archives the previous published version.
   * Updates the live Workflow.definition.
   */
  static async publish(workflowId, ownerId, { definition, changeSummary = [], bump = 'minor', title = '', description = '' }) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: ownerId });
    if (!workflow) throw new Error('Workflow not found or access denied');

    const currentPublishedTag = workflow.publishedVersion;
    let nextTag;

    if (!currentPublishedTag) {
      // First ever publish — create v1.0.0
      nextTag = 'v1.0.0';
    } else {
      nextTag = incrementSemver(currentPublishedTag, bump);
    }

    const versionNumber = parseSemver(nextTag);
    const now = new Date();

    // Archive the previous published version
    if (currentPublishedTag) {
      await WorkflowVersion.updateMany(
        { workflowId, status: 'published' },
        { $set: { status: 'archived' } }
      );
    }

    // Delete any draft (it's been superseded by the publish)
    await WorkflowVersion.deleteMany({ workflowId, status: 'draft' });

    // Create the new published snapshot
    const versionRecord = await WorkflowVersion.create({
      workflowId,
      version: nextTag,
      versionNumber,
      title: title || `Version ${nextTag}`,
      description,
      definition,
      createdBy: ownerId,
      status: 'published',
      parentVersion: currentPublishedTag || null,
      isRollback: false,
      changeSummary: changeSummary.length > 0 ? changeSummary : [`Published ${nextTag}`],
      publishedAt: now,
    });

    // Update the live Workflow document (definition + version metadata + increment counter)
    const updated = await Workflow.findByIdAndUpdate(
      workflowId,
      {
        $inc: { totalVersions: 1 },
        $set: {
          definition,
          status: 'published',
          currentVersion: nextTag,
          publishedVersion: nextTag,
          draftVersion: null,
          lastPublishedAt: now,
        },
      },
      { new: true }
    );

    return { version: versionRecord, workflow: updated };
  }

  /**
   * Restore a previous version.
   * Creates a NEW version (rollback) with the target version's definition.
   * Never overwrites history.
   */
  static async restore(workflowId, ownerId, targetVersionTag) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: ownerId });
    if (!workflow) throw new Error('Workflow not found or access denied');

    const targetVersion = await WorkflowVersion.findOne({ workflowId, version: targetVersionTag });
    if (!targetVersion) throw new Error(`Version ${targetVersionTag} not found`);

    const currentPublishedTag = workflow.publishedVersion;
    const nextTag = currentPublishedTag ? incrementSemver(currentPublishedTag, 'patch') : 'v1.0.1';
    const versionNumber = parseSemver(nextTag);
    const now = new Date();

    // Archive current published
    await WorkflowVersion.updateMany(
      { workflowId, status: 'published' },
      { $set: { status: 'archived' } }
    );

    // Delete any draft
    await WorkflowVersion.deleteMany({ workflowId, status: 'draft' });

    // Create rollback version record
    const rollbackVersion = await WorkflowVersion.create({
      workflowId,
      version: nextTag,
      versionNumber,
      title: `Rollback to ${targetVersionTag}`,
      description: `Restored from version ${targetVersionTag}`,
      definition: targetVersion.definition,
      createdBy: ownerId,
      status: 'published',
      parentVersion: currentPublishedTag,
      isRollback: true,
      changeSummary: [`Rolled back to ${targetVersionTag}`],
      publishedAt: now,
    });

    // Update live Workflow
    const updated = await Workflow.findByIdAndUpdate(
      workflowId,
      {
        $set: {
          definition: targetVersion.definition,
          status: 'published',
          currentVersion: nextTag,
          publishedVersion: nextTag,
          draftVersion: null,
          lastPublishedAt: now,
        },
        $inc: { totalVersions: 1 },
      },
      { new: true }
    );

    return { version: rollbackVersion, workflow: updated };
  }

  /**
   * Get all versions for a workflow, sorted newest first.
   */
  static async getVersions(workflowId, ownerId) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: ownerId }).select('_id');
    if (!workflow) throw new Error('Workflow not found or access denied');

    return WorkflowVersion.find({ workflowId })
      .sort({ 'versionNumber.major': -1, 'versionNumber.minor': -1, 'versionNumber.patch': -1, createdAt: -1 })
      .populate('createdBy', 'name email')
      .lean();
  }

  /**
   * Get a single version by semver tag.
   */
  static async getVersionByTag(workflowId, ownerId, versionTag) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: ownerId }).select('_id');
    if (!workflow) throw new Error('Workflow not found or access denied');

    const version = await WorkflowVersion.findOne({ workflowId, version: versionTag })
      .populate('createdBy', 'name email')
      .lean();

    if (!version) throw new Error(`Version ${versionTag} not found`);
    return version;
  }

  /**
   * Delete the current draft (if any).
   */
  static async deleteDraft(workflowId, ownerId) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: ownerId });
    if (!workflow) throw new Error('Workflow not found or access denied');

    const deleted = await WorkflowVersion.deleteMany({ workflowId, status: 'draft' });

    await Workflow.findByIdAndUpdate(workflowId, {
      $set: { draftVersion: null },
    });

    return { deleted: deleted.deletedCount };
  }

  // Expose helpers for tests
  static parseSemver = parseSemver;
  static formatSemver = formatSemver;
  static incrementSemver = incrementSemver;
}
