export const githubDailyActivityCommitManifest = {
  type: 'githubDailyActivityCommit',
  label: 'GitHub → Daily Activity Commit',
  category: 'action',
  provider: 'github',
  description: 'Records a daily automation heartbeat in a dedicated GitHub repository activity log.',
  icon: 'GitCommit',
  colorTheme: 'github',
  defaultConfig: {
    repository: '',
    branch: 'main',
    activityFile: '.github/automatex/activity.md',
    commitMessage: 'chore: daily AutomateX activity',
    activityDescription: 'AutomateX daily automation heartbeat',
    dailyDeduplication: true,
    dryRun: false,
    autoCommit: true,
    timezone: 'UTC',
    credentialId: '',
  },
  validate: (config = {}) => {
    const errors = [];
    if (!config.repository && !config.profileRepo) {
      errors.push('Target repository (e.g. USERNAME/REPOSITORY) is required.');
    }
    if (config.repository && !config.repository.includes('/')) {
      errors.push('Repository must be in "owner/repo" format (e.g. username/repo).');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
