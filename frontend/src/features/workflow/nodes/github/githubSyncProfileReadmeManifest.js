import { GitPullRequest, Github } from 'lucide-react';

export const githubSyncProfileReadmeManifest = {
  type: 'githubSyncProfileReadme',
  label: 'GitHub Profile README Sync',
  category: 'INTEGRATIONS',
  provider: 'GitHub',
  icon: Github,
  badgeColor: 'bg-slate-900 text-white border-slate-700',
  description: 'Automatically synchronizes and formats your latest projects in your GitHub profile README.',
  searchKeywords: ['github', 'readme', 'profile', 'sync', 'portfolio', 'markdown', 'repository', 'projects'],
  
  defaultConfig: {
    credentialId: '',
    profileRepo: '',
    readmePath: 'README.md',
    branch: 'main',
    commitMessage: 'docs: sync GitHub profile README projects',
    sortBy: 'updated', // 'updated', 'newest', 'stars', 'alphabetical'
    includePrivate: false,
    includeArchived: false,
    includeForks: false,
    maxProjects: 10,
    showLanguage: true,
    showStars: true,
    showTopics: true,
    showUpdatedAt: true,
    showDescription: true,
    customTitle: '### 🚀 Featured & Recent Projects',
  },

  validate: (config = {}) => {
    const errors = [];
    if (!config.credentialId && !config.token) {
      errors.push('GitHub Connection / Personal Access Token is required.');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
