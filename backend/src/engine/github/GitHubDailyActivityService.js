import { credentialService } from '../../credentials/credentialService.js';
import { maskSecret, GitHubSyncReadmeService } from './GitHubSyncReadmeService.js';

export const DEFAULT_ACTIVITY_FILE = '.github/automatex/activity.md';
export const DEFAULT_COMMIT_MESSAGE = 'chore: daily AutomateX activity';
export const DEFAULT_ACTIVITY_DESCRIPTION = 'AutomateX daily automation heartbeat';

/**
 * Service for GitHub Daily Activity Commit heartbeat automation.
 * Uses native fetch with zero external dependencies, strict idempotency,
 * and reliable contribution graph attribution.
 */
export class GitHubDailyActivityService {
  /**
   * Safely normalize repository strings from owner/repo, URLs, SSH, or single names.
   *
   * @param {string} repoInput - e.g. "owner/repo", "https://github.com/owner/repo.git", "git@github.com:owner/repo"
   * @param {string} defaultOwner - Fallback owner (e.g. authenticated GitHub login)
   * @returns {{ owner: string, repo: string, full: string, isValid: boolean }}
   */
  static normalizeRepository(repoInput, defaultOwner = '') {
    const fallback = String(defaultOwner || '').trim();
    if (!repoInput || typeof repoInput !== 'string') {
      return {
        owner: fallback,
        repo: fallback,
        full: fallback ? `${fallback}/${fallback}` : '',
        isValid: Boolean(fallback),
      };
    }

    let cleaned = repoInput.trim();
    // Strip trailing .git suffix
    cleaned = cleaned.replace(/\.git$/i, '');
    // Strip git SSH prefix: git@github.com:
    cleaned = cleaned.replace(/^git@github\.com:/i, '');
    // Strip URL protocols & GitHub domains (supports http, https, api.github.com/repos)
    cleaned = cleaned.replace(/^https?:\/\/(?:api\.)?github\.com\/(?:repos\/)?/i, '');
    // Strip leading and trailing slashes
    cleaned = cleaned.replace(/^\/+|\/+$/g, '');

    const parts = cleaned.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const owner = parts[0].trim();
      const repo = parts[1].trim();
      return {
        owner,
        repo,
        full: `${owner}/${repo}`,
        isValid: Boolean(owner && repo),
      };
    } else if (parts.length === 1 && parts[0]) {
      const repo = parts[0].trim();
      const owner = fallback || repo;
      return {
        owner,
        repo,
        full: `${owner}/${repo}`,
        isValid: Boolean(owner && repo),
      };
    }

    return {
      owner: fallback,
      repo: fallback,
      full: fallback ? `${fallback}/${fallback}` : '',
      isValid: false,
    };
  }

  /**
   * Resolve token from credential ID or direct string with structured error on failure.
   */
  static async resolveToken(credentialId, userId = null) {
    // 1. Direct environment variable or service lookup
    const resolved = await GitHubSyncReadmeService.resolveToken(credentialId, userId);
    if (resolved && typeof resolved === 'string' && resolved.trim().length > 0) {
      return resolved.trim();
    }

    // 2. Structured error when credential cannot be resolved
    const error = new Error('GitHub credential could not be resolved');
    error.code = 'GITHUB_CREDENTIAL_ERROR';
    error.errorCode = 'GITHUB_CREDENTIAL_ERROR';
    error.statusCode = 401;
    throw error;
  }

  /**
   * Format today's date (YYYY-MM-DD) based on specified timezone (e.g. 'Asia/Kolkata', 'UTC').
   */
  static getTodayDateString(timezone = 'UTC') {
    const tz = (timezone && typeof timezone === 'string' ? timezone.trim() : 'UTC') || 'UTC';
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(now);
    } catch {
      // Fallback to UTC if timezone string is invalid
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Check if today's date is already recorded in the activity content.
   * Matches dedicated markdown list item entries (e.g. "- 2026-10-07 — ...").
   */
  static hasActivityForDate(content = '', dateStr) {
    if (!content || typeof content !== 'string') return false;
    const targetDate = String(dateStr).trim();
    if (!targetDate) return false;

    // Matches line starting with bullet and target date: "- 2026-10-07" or "* 2026-10-07" or "2026-10-07"
    const escaped = targetDate.replace(/[-/]/g, '[-/]');
    const regex = new RegExp(`(?:^|\\r?\\n)\\s*[-*•]?\\s*${escaped}\\b`, 'i');
    return regex.test(content);
  }

  /**
   * Generate or append the new activity entry to existing content.
   */
  static appendActivityEntry(existingContent = '', dateStr, description = DEFAULT_ACTIVITY_DESCRIPTION) {
    const entryLine = `- ${dateStr} — ${description.trim()}`;
    const trimmed = (existingContent || '').trim();

    if (!trimmed) {
      return `# AutomateX Daily Activity\n\n${entryLine}\n`;
    }

    if (!trimmed.startsWith('#')) {
      return `# AutomateX Daily Activity\n\n${trimmed}\n${entryLine}\n`;
    }

    return `${trimmed}\n${entryLine}\n`;
  }

  /**
   * Preview activity commit (dry run test).
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

    // 1. Resolve token
    const token = directToken || (await this.resolveToken(credentialId, userId));

    // 2. Verify authenticated user identity
    const userRes = await GitHubSyncReadmeService.verifyGitHubToken(token);
    const username = userRes.user.login;

    // 3. Normalize repository safely (accepts owner/repo, URLs, SSH)
    const targetRepoConfig = repository || profileRepo || `${username}/${username}`;
    const normalizedRepo = this.normalizeRepository(targetRepoConfig, username);

    if (!normalizedRepo.isValid || !normalizedRepo.owner || !normalizedRepo.repo) {
      const err = new Error(`Invalid repository configuration: "${targetRepoConfig}". Expected format: "owner/repository".`);
      err.code = 'GITHUB_REPOSITORY_INVALID';
      err.errorCode = 'GITHUB_REPOSITORY_INVALID';
      err.statusCode = 400;
      throw err;
    }

    const { owner, repo } = normalizedRepo;

    // 4. Validate repository accessibility and permissions
    try {
      const { data: repoData } = await GitHubSyncReadmeService.makeRequest(`/repos/${owner}/${repo}`, { method: 'GET' }, token);
      if (repoData && repoData.permissions && repoData.permissions.push === false) {
        const permErr = new Error(`Token lacks push/write permissions for repository "${owner}/${repo}".`);
        permErr.code = 'GITHUB_PERMISSION_DENIED';
        permErr.errorCode = 'GITHUB_PERMISSION_DENIED';
        permErr.statusCode = 403;
        throw permErr;
      }
    } catch (checkErr) {
      if (checkErr.statusCode === 404 || checkErr.code === 'GITHUB_REPOSITORY_NOT_FOUND') {
        const notFoundErr = new Error(`Repository "${owner}/${repo}" was not found or is inaccessible.`);
        notFoundErr.code = 'GITHUB_REPOSITORY_NOT_FOUND';
        notFoundErr.errorCode = 'GITHUB_REPOSITORY_NOT_FOUND';
        notFoundErr.statusCode = 404;
        throw notFoundErr;
      }
      throw checkErr;
    }

    // 5. Validate branch existence if specified
    const targetBranch = (branch || 'main').trim();
    try {
      await GitHubSyncReadmeService.makeRequest(`/repos/${owner}/${repo}/branches/${encodeURIComponent(targetBranch)}`, { method: 'GET' }, token);
    } catch (branchErr) {
      if (branchErr.statusCode === 404) {
        const notFoundErr = new Error(`Branch "${targetBranch}" not found in repository "${owner}/${repo}".`);
        notFoundErr.code = 'GITHUB_BRANCH_NOT_FOUND';
        notFoundErr.errorCode = 'GITHUB_BRANCH_NOT_FOUND';
        notFoundErr.statusCode = 404;
        throw notFoundErr;
      }
      // If branch check returns unexpected non-404, propagate
      if (branchErr.statusCode !== 404 && branchErr.code !== 'GITHUB_API_ERROR') {
        throw branchErr;
      }
    }

    // 6. Resolve date & path
    const today = this.getTodayDateString(timezone);
    const resolvedPath = (activityFile || activityPath || filePath || DEFAULT_ACTIVITY_FILE).replace(/^\/+/, '');
    const entryDesc = (activityDescription || description || DEFAULT_ACTIVITY_DESCRIPTION).trim();

    // 7. Fetch current activity file
    const fileData = await GitHubSyncReadmeService.fetchReadme(token, owner, repo, resolvedPath, targetBranch);

    // 8. Check if today's activity is already recorded
    const alreadyCompleted = this.hasActivityForDate(fileData.content, today);

    let proposedContent = fileData.content;
    let changed = false;

    if (!alreadyCompleted) {
      proposedContent = this.appendActivityEntry(fileData.content, today, entryDesc);
      changed = true;
    }

    // 9. Resolve commit identity for attribution
    const commitIdentity = await GitHubSyncReadmeService.resolveGitHubCommitIdentity(token, config);

    return {
      success: true,
      alreadyCompleted,
      changed,
      date: today,
      owner,
      repo,
      branch: fileData.branch || targetBranch,
      file: resolvedPath,
      sha: fileData.sha,
      fileExists: fileData.exists,
      currentContent: fileData.content,
      proposedContent,
      entryDescription: entryDesc,
      commitAuthor: {
        login: commitIdentity.login,
        name: commitIdentity.name,
        email: commitIdentity.email,
        source: commitIdentity.source,
      },
    };
  }

  /**
   * Execute Daily Activity Commit with strict idempotency, SHA conflict handling,
   * commit attribution, and Phase 14 structured diagnostic logging.
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
      executionId = 'N/A',
      workflowId = 'N/A',
      nodeId = 'N/A',
    } = config;

    // Resolve date and path early for structured diagnostic logs
    const localDate = this.getTodayDateString(timezone);
    const resolvedPath = (activityFile || activityPath || filePath || DEFAULT_ACTIVITY_FILE).replace(/^\/+/, '');
    const targetRepoString = repository || profileRepo || '';
    const tempNormalized = this.normalizeRepository(targetRepoString, '');
    const deduplicationKey = `${tempNormalized.full || targetRepoString}:${branch}:${resolvedPath}:${localDate}`;

    // Phase 14: Structured initial diagnostic log
    console.log(`[GitHubDailyActivity]
executionId=${executionId}
workflowId=${workflowId}
nodeId=${nodeId}
repository=${tempNormalized.full || targetRepoString}
branch=${branch}
file=${resolvedPath}
timezone=${timezone}
localDate=${localDate}
deduplicationKey=${deduplicationKey}`);

    // 1. Resolve token
    let token = directToken;
    if (!token) {
      try {
        token = await this.resolveToken(credentialId, userId);
      } catch (err) {
        console.log(`[GitHubDailyActivity]
credentialResolved=false`);
        throw err;
      }
    }

    console.log(`[GitHubDailyActivity]
credentialResolved=true`);

    // 2. Perform preview / validation
    const preview = await this.previewActivityCommit(config, userId);
    const {
      owner,
      repo,
      sha,
      date,
      file,
      branch: targetBranch,
      alreadyCompleted,
      proposedContent,
      entryDescription,
      commitAuthor,
    } = preview;

    console.log(`[GitHubDailyActivity]
existingActivityFound=${alreadyCompleted}`);

    // 3. Deduplication check: if today's activity is already recorded, do NOT commit!
    if (dailyDeduplication && alreadyCompleted) {
      console.log(`[GitHubDailyActivityService] ℹ️ Daily activity for ${date} already exists in ${owner}/${repo}/${file}. Skipping duplicate commit.`);
      return {
        success: true,
        changed: false,
        committed: false,
        date,
        reason: 'already_completed_today',
        repository: `${owner}/${repo}`,
        file,
        branch: targetBranch,
        commitAuthor,
      };
    }

    // 4. Handle Dry Run mode
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
        commitAuthor,
      };
    }

    // 5. Prepare Commit Payload with author & committer attribution
    console.log(`[GitHubDailyActivity]
creatingCommit=true`);

    const base64Content = Buffer.from(proposedContent, 'utf-8').toString('base64');
    const msg = (commitMessage || DEFAULT_COMMIT_MESSAGE).trim();
    const finalCommitMessage = msg.includes('[automatex-sync]')
      ? msg
      : `${msg} [skip ci] [automatex-sync]`;

    const putPayload = {
      message: finalCommitMessage,
      content: base64Content,
      branch: targetBranch,
      author: {
        name: commitAuthor.name,
        email: commitAuthor.email,
      },
      committer: {
        name: commitAuthor.name,
        email: commitAuthor.email,
      },
    };

    if (sha) {
      putPayload.sha = sha;
    }

    // 6. Commit to GitHub (with 409 SHA conflict retry handling)
    try {
      const { data } = await GitHubSyncReadmeService.makeRequest(
        `/repos/${owner}/${repo}/contents/${file}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(putPayload),
        },
        token
      );

      const commitSha = data?.commit?.sha || null;
      if (!commitSha) {
        const shaErr = new Error('GitHub did not return a valid commit SHA in the response.');
        shaErr.code = 'GITHUB_COMMIT_FAILED';
        shaErr.errorCode = 'GITHUB_COMMIT_FAILED';
        shaErr.statusCode = 502;
        throw shaErr;
      }

      console.log(`[GitHubDailyActivity]
commitCreated=true
commitSha=${commitSha}`);

      return {
        success: true,
        changed: true,
        committed: true,
        date,
        repository: `${owner}/${repo}`,
        file,
        branch: targetBranch,
        commitSha,
        commitUrl: data.commit?.html_url || `https://github.com/${owner}/${repo}/commit/${commitSha}`,
        commitAuthor: {
          login: commitAuthor.login,
          name: commitAuthor.name,
          email: commitAuthor.email,
          source: commitAuthor.source,
        },
        committer: {
          name: commitAuthor.name,
          email: commitAuthor.email,
        },
        message: finalCommitMessage,
      };
    } catch (err) {
      // Handle 409 SHA conflict: refetch latest file, re-check deduplication, re-append, and retry
      if (err.statusCode === 409 || err.code === 'GITHUB_SHA_CONFLICT') {
        console.warn(`[GitHubDailyActivityService] ⚠️ 409 SHA conflict detected for ${owner}/${repo}/${file}. Refetching fresh file...`);
        const freshFile = await GitHubSyncReadmeService.fetchReadme(token, owner, repo, file, targetBranch);

        // Re-check deduplication on fresh content: if another process committed today's entry, stop safely
        if (dailyDeduplication && this.hasActivityForDate(freshFile.content, date)) {
          console.log(`[GitHubDailyActivityService] ℹ️ Fresh file check confirms today's activity was already recorded. Skipping duplicate.`);
          return {
            success: true,
            changed: false,
            committed: false,
            date,
            reason: 'already_completed_today',
            repository: `${owner}/${repo}`,
            file,
            branch: targetBranch,
            commitAuthor,
            conflictResolved: true,
          };
        }

        const freshProposedContent = this.appendActivityEntry(freshFile.content, date, entryDescription);
        putPayload.content = Buffer.from(freshProposedContent, 'utf-8').toString('base64');
        if (freshFile.sha) {
          putPayload.sha = freshFile.sha;
        }

        const { data: retryData } = await GitHubSyncReadmeService.makeRequest(
          `/repos/${owner}/${repo}/contents/${file}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(putPayload),
          },
          token
        );

        const retrySha = retryData?.commit?.sha || null;
        if (!retrySha) {
          const shaErr = new Error('GitHub did not return a valid commit SHA on conflict retry.');
          shaErr.code = 'GITHUB_COMMIT_FAILED';
          shaErr.errorCode = 'GITHUB_COMMIT_FAILED';
          shaErr.statusCode = 502;
          throw shaErr;
        }

        console.log(`[GitHubDailyActivity]
commitCreated=true
commitSha=${retrySha}`);

        return {
          success: true,
          changed: true,
          committed: true,
          date,
          repository: `${owner}/${repo}`,
          file,
          branch: targetBranch,
          commitSha: retrySha,
          commitUrl: retryData.commit?.html_url || `https://github.com/${owner}/${repo}/commit/${retrySha}`,
          commitAuthor: {
            login: commitAuthor.login,
            name: commitAuthor.name,
            email: commitAuthor.email,
            source: commitAuthor.source,
          },
          committer: {
            name: commitAuthor.name,
            email: commitAuthor.email,
          },
          message: finalCommitMessage,
          retriedOnConflict: true,
        };
      }

      // Explicit structured error
      const errCode = err.code || err.errorCode || 'GITHUB_ACTIVITY_ERROR';
      err.code = errCode;
      err.errorCode = errCode;
      throw err;
    }
  }
}
