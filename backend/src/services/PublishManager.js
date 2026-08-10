import { VersionManager } from './VersionManager.js';
import { WorkflowVersion } from '../models/WorkflowVersion.js';
import { Workflow } from '../models/Workflow.js';
import { CronScheduler } from '../runtime/scheduler/CronScheduler.js';
import { GoogleSheetsTriggerScheduler } from '../runtime/scheduler/GoogleSheetsTriggerScheduler.js';
import { DiscordTriggerScheduler } from '../runtime/scheduler/DiscordTriggerScheduler.js';

/**
 * PublishManager — Orchestrates the publish flow.
 *
 * Ensures:
 * - First publish initializes v1.0.0
 * - Subsequent publishes correctly increment semver
 * - The live Workflow.definition is always the published snapshot
 * - Execution engine always resolves the published version
 * - CronScheduler automatically registers published workflows
 */
export class PublishManager {
  /**
   * Publish a workflow, creating a new semver version snapshot.
   * If this is the first publish, creates v1.0.0.
   * Otherwise increments the version by the given bump type.
   *
   * @param {string} workflowId
   * @param {string} ownerId
   * @param {Object} body - { definition, changeSummary, bump, title, description }
   */
  static async publishWorkflow(workflowId, ownerId, body = {}) {
    const { definition, changeSummary = [], bump = 'minor', title = '', description = '' } = body;

    const workflow = await Workflow.findOne({ _id: workflowId, owner: ownerId });
    if (!workflow) throw new Error('Workflow not found or access denied');

    const activeDefinition = definition || workflow.definition;

    let result;

    // First publish: no currentVersion exists
    if (!workflow.publishedVersion) {
      result = await VersionManager.createInitialVersion(workflowId, ownerId, activeDefinition, {
        title: title || 'Initial Release',
        description,
        changeSummary: changeSummary.length > 0 ? changeSummary : ['Initial release'],
      });

      // Ensure live definition is set
      await Workflow.findByIdAndUpdate(workflowId, {
        $set: { definition: activeDefinition, status: 'published' },
      });
    } else {
      // Subsequent publish: increment version
      result = await VersionManager.publish(workflowId, ownerId, {
        definition: activeDefinition,
        changeSummary,
        bump,
        title,
        description,
      });
    }

    // Phase 13, 17 & Discord: Register Cron, Google Sheets & Discord Trigger Schedules automatically
    const updatedWorkflow = await Workflow.findById(workflowId).lean();
    if (updatedWorkflow) {
      CronScheduler.registerWorkflow(updatedWorkflow);
      GoogleSheetsTriggerScheduler.registerWorkflow(updatedWorkflow);
      DiscordTriggerScheduler.registerWorkflow(updatedWorkflow);
    }

    return result;
  }

  /**
   * Get the currently published version definition for a workflow.
   * Used by the execution engine to always resolve the published snapshot.
   */
  static async getPublishedDefinition(workflowId) {
    const workflow = await Workflow.findById(workflowId).select('publishedVersion definition').lean();
    if (!workflow) throw new Error('Workflow not found');

    if (workflow.publishedVersion) {
      const publishedVersion = await WorkflowVersion.findOne({
        workflowId,
        version: workflow.publishedVersion,
        status: 'published',
      }).lean();

      if (publishedVersion) {
        return publishedVersion.definition;
      }
    }

    // Fallback to live definition
    return workflow.definition;
  }
}
