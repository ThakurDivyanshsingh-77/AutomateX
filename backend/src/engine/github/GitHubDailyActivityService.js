import { credentialService } from '../../credentials/credentialService.js';
import { maskSecret, GitHubSyncReadmeService } from './GitHubSyncReadmeService.js';

export const DEFAULT_ACTIVITY_FILE = '.github/automatex/activity.md';
export const DEFAULT_COMMIT_MESSAGE = 'chore: daily AutomateX activity';
export const DEFAULT_ACTIVITY_DESCRIPTION = 'AutomateX daily automation heartbeat';

/**
 * Service for GitHub Daily Activity Commit heartbeat automation.
 * Uses native fetch with zero external dependencies and strict idempotency.
 */
export class GitHubDailyActivityService {
  /**
   * Resolve token from credential ID or direct string
   */
  static async resolveToken(credentialId, userId = null) {
    return GitHubSyncReadmeService.resolveToken(credentialId, userId);
  }

  /**
   * Format today's date (YYYY-MM-DD) based on optional timezone
   */
  static getTodayDateString(timezone = 'UTC') {
    try {
      const now = new Date();
      // Format to YYYY-MM-DD in the specified timezone
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone || 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(now);
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Check if today's date is already recorded in the activity content
   */
  static hasActivityForDate(content = '', dateStr) {
    if (!content || typeof content !== 'string') return false;
    const targetDate = String(dateStr).trim();
    // Match line pattern: "- 2026-08-25" or "2026-08-25" as a date entry
    const regex = new RegExp(`(^|\\n)\\s*[-*]?\\s*` + targetDate.replace(/-/g, '[-/]'), 'i');
    return regex.test(content) || content.includes(targetDate);
  }

  /**
   * Generate or append the new activity entry to existing content
   */
  static appendActivityEntry(existingContent = '', dateStr, description = DEFAULT_ACTIVITY_DESCRIPTION) {
    const entryLine = `- ${dateStr} — ${description.trim()}`;
    const trimmed = (existingContent || '').trim();

    if (!trimmed) {
      return `# AutomateX Daily Activity\n\n${entryLine}\n`;
    }

    // Ensure header exists if missing
    if (!trimmed.startsWith('#')) {
      return `# AutomateX Daily Activity\n\n${trimmed}\n${entryLine}\n`;
    }

    return `${trimmed}\n${entryLine}\n`;
  }

  /**
   * Preview activity commit (dry run test)
   */
  static async previewActivityCommit(config = {}, userId = null) {
    const {
      credentialId,
      token: directToken,
      repository,
      profileRepo,
      branch = 'main',
      activityFile = DEFAULT_ACTIVITY_FILE,
      activityPath = null,
      filePath = null,
      description = DEFAULT_ACTIVITY_DESCRIPTION,
      activityDescription = null,
      timezone = 'UTC',
    } = config;

    const token = directToken || (await this.resolveToken(credentialId, userId));
    if (!token) {
      const error = new Error('GitHub credential is not configured.');
      error.code = 'GITHUB_CREDENTIAL_MISSING';
      throw error;
    }

    // 1. Verify user & resolve repo
    const userRes = await GitHubSyncReadmeService.verifyGitHubToken(token);
    const username = userRes.user.login;

    const targetRepoConfig = repository || profileRepo || `${username}/${username}`;
    let owner = username;
    let repoName = username;

    if (targetRepoConfig && targetRepoConfig.includes('/')) {
      const parts = targetRepoConfig.split('/');
      owner = parts[0].trim();
      repoName = parts[1].trim();
    } else if (targetRepoConfig) {
      repoName = targetRepoConfig.trim();
    }

    // 2. Resolve date & path
    const today = this.getTodayDateString(timezone);
    const resolvedPath = (activityFile || activityPath || filePath || DEFAULT_ACTIVITY_FILE).replace(/^\/+/, '');
    const entryDesc = (activityDescription || description || DEFAULT_ACTIVITY_DESCRIPTION).trim();

    // 3. Fetch current activity file
    const fileData = await GitHubSyncReadmeService.fetchReadme(token, owner, repoName, resolvedPath, branch);

    // 4. Check if today's activity is already recorded
    const alreadyCompleted = this.hasActivityForDate(fileData.content, today);

    let proposedContent = fileData.content;
    let changed = false;

    if (!alreadyCompleted) {
      proposedContent = this.appendActivityEntry(fileData.content, today, entryDesc);
      changed = true;
    }

    return {
      success: true,
      alreadyCompleted,
      changed,
      date: today,
      owner,
      repo: repoName,
      branch: fileData.branch,
      file: resolvedPath,
      sha: fileData.sha,
      fileExists: fileData.exists,
      currentContent: fileData.content,
      proposedContent,
      entryDescription: entryDesc,
    };
  }

  /**
   * Execute Daily Activity Commit with strict idempotency and SHA conflict handling
   */
  static async executeActivityCommit(config = {}, userId = null) {
    const {
      credentialId,
      token: directToken,
      repository,
      profileRepo,
      branch = 'main',
      activityFile = DEFAULT_ACTIVITY_FILE,
      activityPath = null,
      filePath = null,
      commitMessage = DEFAULT_COMMIT_MESSAGE,
      description = DEFAULT_ACTIVITY_DESCRIPTION,
      activityDescription = null,
      timezone = 'UTC',
      dryRun = false,
      dailyDeduplication = true,
    } = config;

    const token = directToken || (await this.resolveToken(credentialId, userId));
    if (!token) {
      const error = new Error('GitHub credential is not configured.');
      error.code = 'GITHUB_CREDENTIAL_MISSING';
      throw error;
    }

    // 1. Dry run preview
    const preview = await this.previewActivityCommit(config, userId);
    const { owner, repo, sha, date, file, branch: targetBranch, alreadyCompleted, proposedContent, entryDescription } = preview;

    // 2. Deduplication check: if today's activity is already recorded, do NOT commit!
    if (dailyDeduplication && alreadyCompleted) {
      console.log(`[GitHubDailyActivityService] ℹ️ Daily activity for ${date} already exists in ${owner}/${repo}/${file}. Skipping commit.`);
      return {
        success: true,
        changed: false,
        committed: false,
        date,
        reason: 'already_completed_today',
        repository: `${owner}/${repo}`,
        file,
        branch: targetBranch,
      };
    }

    // 3. Handle Dry Run mode
    if (dryRun) {
      console.log(`[GitHubDailyActivityService] 🔍 Dry run mode enabled. Would commit activity for ${date} to ${owner}/${repo}/${file}.`);
      return {
        success: true,
        dryRun: true,
        changed: true,
        committed: false,
        wouldCommit: true,
        date,
        repository: `${owner}/${repo}`,
        file,
        branch: targetBranch,
        entryDescription,
      };
    }

    // 4. Prepare Commit Payload
    const base64Content = Buffer.from(proposedContent, 'utf-8').toString('base64');
    const msg = (commitMessage || DEFAULT_COMMIT_MESSAGE).trim();
    const finalCommitMessage = msg.includes('[automatex-sync]')
      ? msg
      : `${msg} [skip ci] [automatex-sync]`;

    const putPayload = {
      message: finalCommitMessage,
      content: base64Content,
      branch: targetBranch,
      committer: {
        name: 'AutomateX Bot',
        email: 'bot@automatex.dev',
      },
    };

    if (sha) {
      putPayload.sha = sha;
    }

    // 5. Commit to GitHub (with 409 SHA conflict retry handling)
    try {
      const { data } = await GitHubSyncReadmeService.makeRequest(`/repos/${owner}/${repo}/contents/${file}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(putPayload),
      }, token);

      console.log(`[GitHubDailyActivityService] ✅ Daily activity commit successfully created for ${date}: ${data.commit?.sha}`);

      return {
        success: true,
        changed: true,
        committed: true,
        date,
        repository: `${owner}/${repo}`,
        file,
        branch: targetBranch,
        commitSha: data.commit?.sha || null,
        commitUrl: data.commit?.html_url || null,
        message: finalCommitMessage,
      };
    } catch (err) {
      // Handle 409 SHA conflict: refetch latest file, re-check, re-append, and retry
      if (err.statusCode === 409 || err.code === 'GITHUB_SHA_CONFLICT') {
        console.warn(`[GitHubDailyActivityService] ⚠️ 409 SHA conflict detected for ${owner}/${repo}/${file}. Refetching fresh file...`);
        const freshFile = await GitHubSyncReadmeService.fetchReadme(token, owner, repo, file, targetBranch);

        // Re-check deduplication on fresh content
        if (dailyDeduplication && this.hasActivityForDate(freshFile.content, date)) {
          return {
            success: true,
            changed: false,
            committed: false,
            date,
            reason: 'already_completed_today',
            repository: `${owner}/${repo}`,
            file,
            branch: targetBranch,
            conflictResolved: true,
          };
        }

        const freshProposedContent = this.appendActivityEntry(freshFile.content, date, entryDescription);
        putPayload.content = Buffer.from(freshProposedContent, 'utf-8').toString('base64');
        if (freshFile.sha) {
          putPayload.sha = freshFile.sha;
        }

        const { data: retryData } = await GitHubSyncReadmeService.makeRequest(`/repos/${owner}/${repo}/contents/${file}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(putPayload),
        }, token);

        return {
          success: true,
          changed: true,
          committed: true,
          date,
          repository: `${owner}/${repo}`,
          file,
          branch: targetBranch,
          commitSha: retryData.commit?.sha || null,
          commitUrl: retryData.commit?.html_url || null,
          message: finalCommitMessage,
          retriedOnConflict: true,
        };
      }
      throw err;
    }
  }
}
