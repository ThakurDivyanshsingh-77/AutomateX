import { credentialService } from '../../credentials/credentialService.js';

export const AUTOMATEX_START_MARKER = '<!-- AUTOMATEX_PROJECTS_START -->';
export const AUTOMATEX_END_MARKER = '<!-- AUTOMATEX_PROJECTS_END -->';

/**
 * Mask sensitive credentials or tokens in strings and objects
 */
export const maskSecret = (secret) => {
  if (!secret || typeof secret !== 'string') return '';
  if (secret.length <= 8) return '****';
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
};

/**
 * GitHub REST API Client & Profile README Synchronization Service
 * Uses native fetch for zero-dependency high performance.
 */
export class GitHubSyncReadmeService {
  /**
   * Resolve token from credential ID or direct string
   */
  static async resolveToken(credentialId, userId = null) {
    if (!credentialId) return null;
    try {
      const secret = await credentialService.getCredentialById(credentialId, userId);
      if (!secret) return null;
      if (typeof secret === 'string') return secret.trim();
      return (secret.token || secret.accessToken || secret.apiKey || secret.secret || '').trim();
    } catch (err) {
      console.warn(`[GitHubSyncReadmeService] ⚠️ Failed to resolve credential (${credentialId}): ${err.message}`);
      return null;
    }
  }

  /**
   * Helper to perform authenticated GitHub API requests
   */
  static async makeRequest(endpoint, options = {}, token) {
    if (!token) {
      const err = new Error('GitHub Authentication failed: No GitHub Personal Access Token or OAuth token provided.');
      err.statusCode = 401;
      throw err;
    }

    const cleanToken = token.startsWith('Bearer ') || token.startsWith('token ')
      ? token
      : `Bearer ${token}`;

    const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`;
    const headers = {
      Authorization: cleanToken,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'AutomateX-Workflow-Platform/1.0',
      ...(options.headers || {}),
    };

    let response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (networkErr) {
      const err = new Error(`GitHub Network Error: ${networkErr.message}`);
      throw err;
    }

    const contentType = response.headers.get('content-type') || '';
    let responseData = null;
    if (contentType.includes('application/json')) {
      responseData = await response.json().catch(() => null);
    } else {
      responseData = await response.text().catch(() => '');
    }

    if (!response.ok) {
      const status = response.status;
      const msg = (responseData && typeof responseData === 'object' && responseData.message) || responseData || 'GitHub API error';

      if (status === 401) {
        const error = new Error(`GitHub Authentication Failed (401): Bad credentials or expired token. Please verify your GitHub Personal Access Token in Credentials.`);
        error.statusCode = 401;
        throw error;
      }
      if (status === 403) {
        const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
        if (rateLimitRemaining === '0') {
          const resetTime = response.headers.get('x-ratelimit-reset');
          const resetDate = resetTime ? new Date(parseInt(resetTime, 10) * 1000).toLocaleTimeString() : 'soon';
          const error = new Error(`GitHub API Rate Limit Exceeded (403): Rate limit resets at ${resetDate}.`);
          error.statusCode = 429;
          throw error;
        }
        const error = new Error(`GitHub Permission Denied (403): Your GitHub token lacks required permissions (needs 'repo' or 'public_repo' scope to read/write repositories).`);
        error.statusCode = 403;
        throw error;
      }
      if (status === 404) {
        const error = new Error(`GitHub Resource Not Found (404): The specified repository or file does not exist or your token cannot access it.`);
        error.statusCode = 404;
        throw error;
      }
      if (status === 409) {
        const error = new Error(`GitHub Conflict (409): File SHA mismatch or race condition.`);
        error.statusCode = 409;
        throw error;
      }
      if (status === 422) {
        const error = new Error(`GitHub Validation Failed (422): ${msg}`);
        error.statusCode = 422;
        throw error;
      }

      const error = new Error(`GitHub API Error (${status}): ${msg}`);
      error.statusCode = status;
      throw error;
    }

    return {
      status: response.status,
      headers: response.headers,
      data: responseData,
    };
  }

  /**
   * Verify token and retrieve user profile info
   */
  static async verifyGitHubToken(token) {
    const { data } = await this.makeRequest('/user', { method: 'GET' }, token);
    return {
      success: true,
      user: {
        login: data.login,
        id: data.id,
        name: data.name || data.login,
        avatarUrl: data.avatar_url,
        htmlUrl: data.html_url,
        publicRepos: data.public_repos,
        totalPrivateRepos: data.total_private_repos || 0,
      },
    };
  }

  /**
   * Fetch authenticated user's repositories with filtering and sorting
   */
  static async listUserRepositories(token, options = {}) {
    const {
      includePrivate = false,
      includeArchived = false,
      includeForks = false,
      sortBy = 'updated', // 'updated', 'newest', 'stars', 'alphabetical'
      maxProjects = 10,
      profileRepo = null, // Exclude the profile README repo itself from the list
    } = options;

    const { data: repos } = await this.makeRequest('/user/repos?per_page=100&affiliation=owner&sort=updated&direction=desc', { method: 'GET' }, token);

    if (!Array.isArray(repos)) return [];

    let filtered = repos.filter((r) => {
      // Exclude the profile repository itself (e.g. username/username) to avoid self-referencing
      if (profileRepo && (r.full_name?.toLowerCase() === profileRepo.toLowerCase() || r.name?.toLowerCase() === profileRepo.toLowerCase())) {
        return false;
      }

      if (!includePrivate && r.private) return false;
      if (!includeArchived && r.archived) return false;
      if (!includeForks && r.fork) return false;
      return true;
    });

    // Sort
    if (sortBy === 'newest' || sortBy === 'created') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'stars') {
      filtered.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
    } else if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // 'updated' default
      filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    // Slice limit
    const limit = Math.max(1, Math.min(parseInt(maxProjects, 10) || 10, 50));
    filtered = filtered.slice(0, limit);

    // Deduplicate by repository ID/name
    const seen = new Set();
    const deduplicated = [];
    for (const repo of filtered) {
      if (!seen.has(repo.id)) {
        seen.add(repo.id);
        deduplicated.push({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description || 'No description provided.',
          htmlUrl: repo.html_url,
          language: repo.language || null,
          topics: Array.isArray(repo.topics) ? repo.topics : [],
          stargazersCount: repo.stargazers_count || 0,
          forksCount: repo.forks_count || 0,
          updatedAt: repo.updated_at,
          createdAt: repo.created_at,
          visibility: repo.visibility || (repo.private ? 'private' : 'public'),
          archived: Boolean(repo.archived),
          fork: Boolean(repo.fork),
        });
      }
    }

    return deduplicated;
  }

  /**
   * Fetch README content and its current SHA from GitHub Contents API
   */
  static async fetchReadme(token, owner, repo, path = 'README.md', branch = null) {
    const cleanPath = (path || 'README.md').replace(/^\/+/, '');
    const query = branch ? `?ref=${encodeURIComponent(branch)}` : '';

    try {
      const { data } = await this.makeRequest(`/repos/${owner}/${repo}/contents/${cleanPath}${query}`, { method: 'GET' }, token);

      let content = '';
      if (data.content && data.encoding === 'base64') {
        content = Buffer.from(data.content, 'base64').toString('utf-8');
      } else if (typeof data.content === 'string') {
        content = data.content;
      }

      return {
        exists: true,
        sha: data.sha,
        content,
        path: data.path,
        branch: branch || data.default_branch || 'main',
      };
    } catch (err) {
      if (err.statusCode === 404) {
        return {
          exists: false,
          sha: null,
          content: '',
          path: cleanPath,
          branch: branch || 'main',
        };
      }
      throw err;
    }
  }

  /**
   * Deterministic template generation for the managed projects section
   */
  static generateProjectsMarkdown(projects = [], formatConfig = {}) {
    const {
      showLanguage = true,
      showStars = true,
      showTopics = true,
      showUpdatedAt = true,
      showDescription = true,
      customTitle = '### 🚀 Featured & Recent Projects',
    } = formatConfig;

    if (!projects || projects.length === 0) {
      return `${customTitle}\n\n_No public repositories found to display._\n`;
    }

    const lines = [customTitle, ''];

    for (const project of projects) {
      // 1. Project Title Link
      lines.push(`### [${project.name}](${project.htmlUrl})`);

      // 2. Description
      if (showDescription && project.description) {
        lines.push(`${project.description.trim()}`);
      }

      // 3. Metadata row (Stars, Language, Updated Date)
      const metaParts = [];
      if (showStars && project.stargazersCount !== undefined) {
        metaParts.push(`⭐ **${project.stargazersCount} ${project.stargazersCount === 1 ? 'star' : 'stars'}**`);
      }
      if (showLanguage && project.language) {
        metaParts.push(`💻 **${project.language}**`);
      }
      if (showUpdatedAt && project.updatedAt) {
        const dateStr = new Date(project.updatedAt).toISOString().split('T')[0];
        metaParts.push(`🕒 Updated: \`${dateStr}\``);
      }

      if (metaParts.length > 0) {
        lines.push(`- ${metaParts.join(' • ')}`);
      }

      // 4. Topics / Tags
      if (showTopics && project.topics && project.topics.length > 0) {
        const topicBadges = project.topics
          .slice(0, 8)
          .map((t) => `\`${t}\``)
          .join(' ');
        lines.push(`- 🏷️ ${topicBadges}`);
      }

      lines.push(''); // blank line between projects
    }

    return lines.join('\n').trim();
  }

  /**
   * Safely inject or replace the managed section inside the README
   */
  static injectManagedSection(currentReadme = '', newProjectsSection = '') {
    const formattedManagedBlock = `${AUTOMATEX_START_MARKER}\n${newProjectsSection.trim()}\n${AUTOMATEX_END_MARKER}`;

    const startIndex = currentReadme.indexOf(AUTOMATEX_START_MARKER);
    const endIndex = currentReadme.indexOf(AUTOMATEX_END_MARKER);

    // Case 1: Both markers exist -> strictly replace ONLY the content between markers
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const before = currentReadme.substring(0, startIndex).trimEnd();
      const after = currentReadme.substring(endIndex + AUTOMATEX_END_MARKER.length).trimStart();

      let combined = '';
      if (before && after) {
        combined = `${before}\n\n${formattedManagedBlock}\n\n${after}`;
      } else if (before) {
        combined = `${before}\n\n${formattedManagedBlock}\n`;
      } else if (after) {
        combined = `${formattedManagedBlock}\n\n${after}`;
      } else {
        combined = `${formattedManagedBlock}\n`;
      }
      return combined;
    }

    // Case 2: No markers exist -> preserve existing README and append managed section safely
    const trimmedOriginal = (currentReadme || '').trim();
    if (!trimmedOriginal) {
      return `${formattedManagedBlock}\n`;
    }

    return `${trimmedOriginal}\n\n${formattedManagedBlock}\n`;
  }

  /**
   * Compare old and new content to check if meaningful changes exist
   */
  static hasContentChanged(oldContent = '', newContent = '') {
    return oldContent.trim() !== newContent.trim();
  }

  /**
   * Preview Sync (Dry Run Test): generates previews & diff without writing to GitHub
   */
  static async previewSync(config = {}, userId = null) {
    const {
      credentialId,
      token: directToken,
      profileRepo,
      readmePath = 'README.md',
      branch = 'main',
      sortBy = 'updated',
      includePrivate = false,
      includeArchived = false,
      includeForks = false,
      maxProjects = 10,
      showLanguage = true,
      showStars = true,
      showTopics = true,
      showUpdatedAt = true,
      showDescription = true,
      customTitle = '### 🚀 Featured & Recent Projects',
    } = config;

    const token = directToken || (await this.resolveToken(credentialId, userId));
    if (!token) {
      throw new Error('GitHub connection error: Please select a valid GitHub credential or provide a Personal Access Token.');
    }

    // 1. Verify user
    const userRes = await this.verifyGitHubToken(token);
    const username = userRes.user.login;

    // 2. Resolve profile repo name (defaults to username/username)
    let owner = username;
    let repoName = username;
    if (profileRepo && profileRepo.includes('/')) {
      const parts = profileRepo.split('/');
      owner = parts[0].trim();
      repoName = parts[1].trim();
    } else if (profileRepo) {
      repoName = profileRepo.trim();
    }

    // 3. Fetch user repositories
    const projects = await this.listUserRepositories(token, {
      includePrivate,
      includeArchived,
      includeForks,
      sortBy,
      maxProjects,
      profileRepo: `${owner}/${repoName}`,
    });

    // 4. Fetch current README
    const readmeData = await this.fetchReadme(token, owner, repoName, readmePath, branch);

    // 5. Generate new projects section
    const generatedSection = this.generateProjectsMarkdown(projects, {
      showLanguage,
      showStars,
      showTopics,
      showUpdatedAt,
      showDescription,
      customTitle,
    });

    // 6. Inject into README
    const finalReadme = this.injectManagedSection(readmeData.content, generatedSection);
    const changed = this.hasContentChanged(readmeData.content, finalReadme);

    return {
      success: true,
      hasChanges: changed,
      owner,
      repo: repoName,
      branch: readmeData.branch,
      readmePath,
      sha: readmeData.sha,
      readmeExists: readmeData.exists,
      projectsCount: projects.length,
      projects,
      currentReadme: readmeData.content,
      generatedSection,
      finalReadme,
    };
  }

  /**
   * Execute Sync (Commit to GitHub if changed)
   */
  static async executeSync(config = {}, userId = null) {
    const {
      credentialId,
      token: directToken,
      profileRepo,
      readmePath = 'README.md',
      branch = 'main',
      commitMessage = 'docs: sync GitHub profile README projects',
      sortBy = 'updated',
      includePrivate = false,
      includeArchived = false,
      includeForks = false,
      maxProjects = 10,
      showLanguage = true,
      showStars = true,
      showTopics = true,
      showUpdatedAt = true,
      showDescription = true,
      customTitle = '### 🚀 Featured & Recent Projects',
    } = config;

    const token = directToken || (await this.resolveToken(credentialId, userId));
    if (!token) {
      throw new Error('GitHub connection error: Please select a valid GitHub credential or provide a Personal Access Token.');
    }

    // 1. Dry run preview to fetch, parse, and diff
    const preview = await this.previewSync(config, userId);
    const { owner, repo, sha, finalReadme, projects, readmePath: path, branch: targetBranch } = preview;

    // 2. Idempotency check: if no changes, do NOT commit!
    if (!preview.hasChanges) {
      return {
        success: true,
        updated: false,
        reason: 'README already up to date',
        repository: `${owner}/${repo}`,
        file: path,
        branch: targetBranch,
        projectsCount: projects.length,
      };
    }

    // 3. Prepare GitHub Contents API commit payload
    const base64Content = Buffer.from(finalReadme, 'utf-8').toString('base64');
    const finalCommitMessage = (commitMessage || 'docs: sync GitHub profile README projects')
      .includes('[automatex-sync]')
      ? commitMessage
      : `${commitMessage} [skip ci] [automatex-sync]`;

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

    // 4. Commit to GitHub (with 409 conflict retry handling)
    try {
      const cleanPath = (path || 'README.md').replace(/^\/+/, '');
      const { data } = await this.makeRequest(`/repos/${owner}/${repo}/contents/${cleanPath}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(putPayload),
      }, token);

      return {
        success: true,
        updated: true,
        repository: `${owner}/${repo}`,
        file: cleanPath,
        branch: targetBranch,
        commit: {
          sha: data.commit?.sha || null,
          url: data.commit?.html_url || null,
          message: finalCommitMessage,
        },
        projectsCount: projects.length,
        projectsAdded: projects.length,
      };
    } catch (err) {
      // If 409 Conflict occurred (SHA mismatch due to race condition), refetch once and retry
      if (err.statusCode === 409) {
        console.warn(`[GitHubSyncReadmeService] ⚠️ 409 SHA conflict detected for ${owner}/${repo}. Retrying with fresh SHA...`);
        const freshReadme = await this.fetchReadme(token, owner, repo, path, targetBranch);
        if (freshReadme.sha) {
          putPayload.sha = freshReadme.sha;
          const freshFinalReadme = this.injectManagedSection(freshReadme.content, preview.generatedSection);
          putPayload.content = Buffer.from(freshFinalReadme, 'utf-8').toString('base64');

          const { data: retryData } = await this.makeRequest(`/repos/${owner}/${repo}/contents/${cleanPath}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(putPayload),
          }, token);

          return {
            success: true,
            updated: true,
            repository: `${owner}/${repo}`,
            file: cleanPath,
            branch: targetBranch,
            commit: {
              sha: retryData.commit?.sha || null,
              url: retryData.commit?.html_url || null,
            },
            projectsCount: projects.length,
            retriedOnConflict: true,
          };
        }
      }
      throw err;
    }
  }
}
