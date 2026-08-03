import { VersionManager } from '../services/VersionManager.js';
import { VersionComparator } from '../services/VersionComparator.js';
import { PublishManager } from '../services/PublishManager.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    List all versions for a workflow
// @route   GET /api/v1/workflows/:id/versions
// @access  Private (JWT)
export const listVersions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const versions = await VersionManager.getVersions(id, req.user._id);
  return res.status(200).json({
    success: true,
    count: versions.length,
    versions,
  });
});

// @desc    Get a single version by semver tag
// @route   GET /api/v1/workflows/:id/versions/:version
// @access  Private (JWT)
export const getVersion = asyncHandler(async (req, res) => {
  const { id, version } = req.params;
  const versionRecord = await VersionManager.getVersionByTag(id, req.user._id, decodeURIComponent(version));
  return res.status(200).json({
    success: true,
    version: versionRecord,
  });
});

// @desc    Save / update current draft (autosave on builder changes)
// @route   POST /api/v1/workflows/:id/versions/draft
// @access  Private (JWT)
export const saveDraft = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { definition } = req.body;

  if (!definition) {
    return res.status(400).json({ success: false, message: 'definition is required' });
  }

  const draft = await VersionManager.saveDraft(id, req.user._id, definition);
  return res.status(200).json({
    success: true,
    message: 'Draft saved',
    draft,
  });
});

// @desc    Publish a new version of the workflow
// @route   POST /api/v1/workflows/:id/publish
// @access  Private (JWT)
export const publishVersion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { definition, changeSummary = [], bump = 'minor', title = '', description = '' } = req.body;

  const result = await PublishManager.publishWorkflow(id, req.user._id, {
    definition,
    changeSummary,
    bump,
    title,
    description,
  });

  return res.status(200).json({
    success: true,
    message: 'Workflow published successfully',
    version: result.version || result,
    workflow: result.workflow || null,
  });
});

// @desc    Restore a workflow to a previous version (creates a new rollback version)
// @route   POST /api/v1/workflows/:id/restore/:version
// @access  Private (JWT)
export const restoreVersion = asyncHandler(async (req, res) => {
  const { id, version } = req.params;

  const result = await VersionManager.restore(id, req.user._id, decodeURIComponent(version));
  return res.status(200).json({
    success: true,
    message: `Workflow restored to ${version} (new version: ${result.version.version})`,
    version: result.version,
    workflow: result.workflow,
  });
});

// @desc    Compare two workflow versions
// @route   POST /api/v1/workflows/:id/compare
// @access  Private (JWT)
export const compareVersions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { versionA, versionB } = req.body;

  if (!versionA || !versionB) {
    return res.status(400).json({ success: false, message: 'versionA and versionB are required' });
  }

  const [verA, verB] = await Promise.all([
    VersionManager.getVersionByTag(id, req.user._id, versionA),
    VersionManager.getVersionByTag(id, req.user._id, versionB),
  ]);

  const diff = VersionComparator.compare(verA.definition, verB.definition);

  return res.status(200).json({
    success: true,
    versionA: { version: verA.version, title: verA.title, publishedAt: verA.publishedAt },
    versionB: { version: verB.version, title: verB.title, publishedAt: verB.publishedAt },
    diff,
  });
});

// @desc    Delete current draft version
// @route   DELETE /api/v1/workflows/:id/draft
// @access  Private (JWT)
export const deleteDraft = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await VersionManager.deleteDraft(id, req.user._id);
  return res.status(200).json({
    success: true,
    message: `Draft deleted (${result.deleted} records removed)`,
  });
});
