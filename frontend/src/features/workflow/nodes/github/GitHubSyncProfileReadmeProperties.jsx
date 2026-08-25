import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Key, 
  GitBranch, 
  FileText, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Code, 
  Sliders, 
  ShieldCheck, 
  ExternalLink, 
  Layers, 
  Check, 
  Sparkles,
  ArrowRight,
  GitCommit
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import { credentialService } from '../../../credentials/services/credentialService';

export const GitHubSyncProfileReadmeProperties = ({
  node,
  onUpdateNodeData,
  workflowNodes = [],
  executionSnapshot = null,
}) => {
  const config = node?.data?.config || {};

  const [credentials, setCredentials] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [userRepos, setUserRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  // Test Sync Preview State
  const [testingSync, setTestingSync] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);
  const [activePreviewTab, setActivePreviewTab] = useState('final'); // 'current', 'generated', 'final', 'diff'
  const [applyingSync, setApplyingSync] = useState(false);
  const [applyResult, setApplyResult] = useState(null);

  // Load available GitHub credentials
  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    setLoadingCreds(true);
    try {
      const res = await credentialService.getCredentials();
      const allCreds = res.data || [];
      const githubCreds = allCreds.filter(
        (c) => (c.service || '').toLowerCase() === 'github' || (c.service || '').toLowerCase() === 'custom'
      );
      setCredentials(githubCreds);
    } catch (err) {
      console.warn('Failed to load credentials:', err);
    } finally {
      setLoadingCreds(false);
    }
  };

  const updateConfig = (updates) => {
    onUpdateNodeData(node.id, {
      config: {
        ...config,
        ...updates,
      },
    });
  };

  // Fetch available repositories when credential is selected
  const handleFetchUserRepos = async () => {
    if (!config.credentialId && !config.token) {
      return toast.error('Please select a GitHub Credential or enter a token first.');
    }
    setLoadingRepos(true);
    try {
      const res = await api.post('/github/repos', {
        credentialId: config.credentialId,
        token: config.token,
        includePrivate: true,
        includeArchived: true,
        includeForks: true,
        maxProjects: 100,
      });

      if (res.data?.success && Array.isArray(res.data.data)) {
        setUserRepos(res.data.data);
        toast.success(`Loaded ${res.data.data.length} repositories from GitHub`);
        
        // Auto-detect profile repo (username/username) if not yet configured
        if (!config.profileRepo && res.data.data.length > 0) {
          const firstFullName = res.data.data[0].fullName || '';
          const owner = firstFullName.split('/')[0];
          if (owner) {
            const profileMatch = res.data.data.find(
              (r) => r.fullName?.toLowerCase() === `${owner}/${owner}`.toLowerCase() || r.name?.toLowerCase() === owner.toLowerCase()
            );
            if (profileMatch) {
              updateConfig({ profileRepo: profileMatch.fullName || `${owner}/${owner}` });
              toast.success(`Auto-detected profile README repository: ${owner}/${owner}`);
            }
          }
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch repositories from GitHub');
    } finally {
      setLoadingRepos(false);
    }
  };

  // Test README Sync (Dry Run Preview)
  const handleTestSync = async () => {
    if (!config.credentialId && !config.token) {
      return toast.error('Please select a GitHub credential or enter a token.');
    }
    setTestingSync(true);
    setPreviewResult(null);
    setApplyResult(null);

    try {
      const res = await api.post('/github/profile-readme/preview', {
        config: {
          credentialId: config.credentialId,
          token: config.token,
          profileRepo: config.profileRepo,
          readmePath: config.readmePath || 'README.md',
          branch: config.branch || 'main',
          sortBy: config.sortBy || 'updated',
          includePrivate: Boolean(config.includePrivate),
          includeArchived: Boolean(config.includeArchived),
          includeForks: Boolean(config.includeForks),
          maxProjects: config.maxProjects || 10,
          showLanguage: config.showLanguage !== false,
          showStars: config.showStars !== false,
          showTopics: config.showTopics !== false,
          showUpdatedAt: config.showUpdatedAt !== false,
          showDescription: config.showDescription !== false,
          customTitle: config.customTitle || '### 🚀 Featured & Recent Projects',
        },
      });

      if (res.data?.success) {
        setPreviewResult(res.data);
        toast.success(
          res.data.hasChanges
            ? `Sync Preview Ready: ${res.data.projectsCount} projects formatted (Changes Detected)`
            : `Sync Preview Ready: README is already up to date!`,
          { duration: 3000 }
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to run README sync preview');
    } finally {
      setTestingSync(false);
    }
  };

  // Apply to GitHub (Explicit Write Action)
  const handleApplyToGitHub = async () => {
    if (!config.credentialId && !config.token) {
      return toast.error('Please select a GitHub credential or enter a token.');
    }
    setApplyingSync(true);
    setApplyResult(null);

    try {
      const res = await api.post('/github/profile-readme/apply', {
        config: {
          credentialId: config.credentialId,
          token: config.token,
          profileRepo: config.profileRepo,
          readmePath: config.readmePath || 'README.md',
          branch: config.branch || 'main',
          commitMessage: config.commitMessage || 'docs: sync GitHub profile README projects',
          sortBy: config.sortBy || 'updated',
          includePrivate: Boolean(config.includePrivate),
          includeArchived: Boolean(config.includeArchived),
          includeForks: Boolean(config.includeForks),
          maxProjects: config.maxProjects || 10,
          showLanguage: config.showLanguage !== false,
          showStars: config.showStars !== false,
          showTopics: config.showTopics !== false,
          showUpdatedAt: config.showUpdatedAt !== false,
          showDescription: config.showDescription !== false,
          customTitle: config.customTitle || '### 🚀 Featured & Recent Projects',
        },
      });

      if (res.data?.success) {
        setApplyResult(res.data);
        if (res.data.updated) {
          toast.success(`Successfully updated GitHub README! Commit: ${res.data.commit?.sha?.slice(0, 7)}`, {
            duration: 4000,
          });
        } else {
          toast.success(res.data.reason || 'README already up to date. No commit needed.');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply changes to GitHub');
    } finally {
      setApplyingSync(false);
    }
  };

  return (
    <div className="space-y-5 text-xs text-slate-700 font-sans">
      {/* 1. GitHub Credential / Authentication Selector */}
      <div className="space-y-2 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-900 flex items-center gap-1.5">
            <Github className="w-4 h-4 text-slate-900" />
            <span>GitHub Connection</span>
          </label>
          <span className="text-[10px] text-purple-700 font-semibold uppercase bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
            Required
          </span>
        </div>

        {credentials.length > 0 ? (
          <select
            value={config.credentialId || ''}
            onChange={(e) => updateConfig({ credentialId: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer font-medium"
          >
            <option value="">Select GitHub Connection from Vault...</option>
            {credentials.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name} ({c.service || 'GitHub'} • {c.authType || 'token'})
              </option>
            ))}
          </select>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-500">
              No saved GitHub credentials found in Credentials Vault. Enter a Personal Access Token below:
            </p>
            <div className="relative">
              <input
                type="password"
                value={config.token || ''}
                onChange={(e) => updateConfig({ token: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (needs 'repo' scope)"
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] pt-1">
          <button
            type="button"
            onClick={handleFetchUserRepos}
            disabled={loadingRepos || (!config.credentialId && !config.token)}
            className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loadingRepos ? 'animate-spin' : ''}`} />
            <span>{loadingRepos ? 'Fetching repos...' : 'Fetch User Repositories'}</span>
          </button>
          <a
            href="https://github.com/settings/tokens/new?scopes=repo"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-slate-600 flex items-center gap-0.5 text-[10px]"
          >
            <span>Create Token</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* 2. Repository & README Location Config */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="font-bold text-slate-800 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Profile Repository</span>
          </label>
          {userRepos.length > 0 ? (
            <select
              value={config.profileRepo || ''}
              onChange={(e) => updateConfig({ profileRepo: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 transition-all cursor-pointer font-mono font-medium"
            >
              <option value="">Select repository (e.g. username/username)...</option>
              {userRepos.map((r) => (
                <option key={r.id} value={r.fullName || r.name}>
                  {r.fullName || r.name} {r.private ? '🔒' : '🌐'}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={config.profileRepo || ''}
              onChange={(e) => updateConfig({ profileRepo: e.target.value })}
              placeholder="e.g. your-username/your-username"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 transition-all font-mono"
            />
          )}
          <span className="text-[10px] text-slate-400 block">
            GitHub profile READMEs reside in the repo named after your username.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">README Path</label>
            <input
              type="text"
              value={config.readmePath || 'README.md'}
              onChange={(e) => updateConfig({ readmePath: e.target.value })}
              placeholder="README.md"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Branch</label>
            <input
              type="text"
              value={config.branch || 'main'}
              onChange={(e) => updateConfig({ branch: e.target.value })}
              placeholder="main"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Project Filter & Sorting Rules */}
      <div className="space-y-3 p-3 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-900 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-purple-600" />
            <span>Repository Query & Filters</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Sort By</label>
            <select
              value={config.sortBy || 'updated'}
              onChange={(e) => updateConfig({ sortBy: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 cursor-pointer font-medium"
            >
              <option value="updated">Recently Updated</option>
              <option value="newest">Newest Created</option>
              <option value="stars">Most Stars</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Max Projects</label>
            <input
              type="number"
              min="1"
              max="50"
              value={config.maxProjects || 10}
              onChange={(e) => updateConfig({ maxProjects: parseInt(e.target.value, 10) || 10 })}
              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Filter Checkboxes */}
        <div className="space-y-2 pt-1 border-t border-slate-200/60">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(config.includePrivate)}
              onChange={(e) => updateConfig({ includePrivate: e.target.checked })}
              className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-700">Include private repositories</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(config.includeArchived)}
              onChange={(e) => updateConfig({ includeArchived: e.target.checked })}
              className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-700">Include archived repositories</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(config.includeForks)}
              onChange={(e) => updateConfig({ includeForks: e.target.checked })}
              className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-700">Include forked repositories</span>
          </label>
        </div>
      </div>

      {/* 4. Display Formatting & Fields */}
      <div className="space-y-2.5">
        <label className="font-bold text-slate-800 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-600" />
          <span>Displayed Project Fields</span>
        </label>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600">Section Header Title</label>
          <input
            type="text"
            value={config.customTitle || '### 🚀 Featured & Recent Projects'}
            onChange={(e) => updateConfig({ customTitle: e.target.value })}
            placeholder="### 🚀 Featured & Recent Projects"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.showLanguage !== false}
              onChange={(e) => updateConfig({ showLanguage: e.target.checked })}
              className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-700">Show Language</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.showStars !== false}
              onChange={(e) => updateConfig({ showStars: e.target.checked })}
              className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-700">Show Stars ⭐</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.showTopics !== false}
              onChange={(e) => updateConfig({ showTopics: e.target.checked })}
              className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-700">Show Topics 🏷️</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.showUpdatedAt !== false}
              onChange={(e) => updateConfig({ showUpdatedAt: e.target.checked })}
              className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-700">Show Updated Date</span>
          </label>
        </div>
      </div>

      {/* 5. Commit Message */}
      <div className="space-y-1">
        <label className="font-bold text-slate-800 flex items-center gap-1.5">
          <GitCommit className="w-3.5 h-3.5 text-purple-600" />
          <span>Git Commit Message</span>
        </label>
        <input
          type="text"
          value={config.commitMessage || 'docs: sync GitHub profile README projects'}
          onChange={(e) => updateConfig({ commitMessage: e.target.value })}
          placeholder="docs: sync GitHub profile README projects"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-purple-500"
        />
        <span className="text-[10px] text-slate-400 block">
          AutomateX adds <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">[skip ci] [automatex-sync]</code> to prevent loop triggers.
        </span>
      </div>

      {/* 6. Non-Destructive Safety Banner */}
      <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Non-Destructive Marker Protection</span>
        </div>
        <p className="text-[11px] text-emerald-800/90 leading-relaxed">
          This node maintains only the AutomateX-managed Projects section inside:
        </p>
        <code className="text-[10px] font-mono block bg-white/80 p-1.5 rounded-lg border border-emerald-200 text-emerald-900 break-all">
          &lt;!-- AUTOMATEX_PROJECTS_START --&gt; ... &lt;!-- AUTOMATEX_PROJECTS_END --&gt;
        </code>
        <p className="text-[10px] text-emerald-700 pt-0.5">
          Content outside the managed markers is never rewritten. If markers are missing, they are appended safely.
        </p>
      </div>

      {/* 7. Interactive Test Sync & Apply Actions */}
      <div className="space-y-3 pt-2 border-t border-slate-200">
        <div className="flex items-center gap-2">
          {/* Test Sync Preview Button */}
          <button
            type="button"
            onClick={handleTestSync}
            disabled={testingSync}
            className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {testingSync ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Test Preview...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Test README Sync</span>
              </>
            )}
          </button>

          {/* Apply to GitHub Action Button */}
          <button
            type="button"
            onClick={handleApplyToGitHub}
            disabled={applyingSync}
            className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {applyingSync ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>Applying...</span>
              </>
            ) : (
              <>
                <Github className="w-3.5 h-3.5 text-purple-400" />
                <span>Apply to GitHub</span>
              </>
            )}
          </button>
        </div>

        {/* Apply Result Banner */}
        {applyResult && (
          <div className={`p-3 rounded-2xl border text-xs ${applyResult.updated ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
            <div className="flex items-center justify-between font-bold pb-1 mb-1 border-b border-current/10">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{applyResult.updated ? 'Commit Pushed to GitHub' : 'README Already Up to Date'}</span>
              </span>
              <span className="font-mono text-[10px]">{applyResult.repository}</span>
            </div>
            {applyResult.commit?.sha && (
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span>Commit SHA: <code className="font-bold">{applyResult.commit.sha.slice(0, 7)}</code></span>
                {applyResult.commit.url && (
                  <a
                    href={applyResult.commit.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-600 hover:underline flex items-center gap-0.5 font-semibold"
                  >
                    <span>View on GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Test Sync Preview Flow Drawer */}
        {previewResult && (
          <div className="space-y-2 p-3 bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Sync Test Preview</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${previewResult.hasChanges ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>
                {previewResult.hasChanges ? 'Changes Detected' : 'Up to Date (No Changes)'}
              </span>
            </div>

            {/* Step Navigation Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setActivePreviewTab('current')}
                className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer ${activePreviewTab === 'current' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
              >
                1. Current README
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('generated')}
                className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer ${activePreviewTab === 'generated' ? 'bg-purple-900/60 text-purple-200 shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
              >
                2. Project Section
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('final')}
                className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer ${activePreviewTab === 'final' ? 'bg-emerald-900/60 text-emerald-200 shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
              >
                3. Final README
              </button>
            </div>

            {/* Tab Preview Pane */}
            <div className="max-h-60 overflow-y-auto p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-purple-600">
              {activePreviewTab === 'current' && (
                <div>
                  <div className="text-slate-500 mb-1 pb-1 border-b border-slate-800">
                    // Existing README ({previewResult.owner}/{previewResult.repo} • {previewResult.readmePath})
                  </div>
                  {previewResult.currentReadme || '// README file is currently empty or not found.'}
                </div>
              )}

              {activePreviewTab === 'generated' && (
                <div>
                  <div className="text-purple-400 mb-1 pb-1 border-b border-slate-800">
                    // Deterministically Generated Project Section ({previewResult.projectsCount} projects)
                  </div>
                  {previewResult.generatedSection}
                </div>
              )}

              {activePreviewTab === 'final' && (
                <div>
                  <div className="text-emerald-400 mb-1 pb-1 border-b border-slate-800">
                    // Final Merged Output (Ready to write to GitHub)
                  </div>
                  {previewResult.finalReadme}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
              <span>{previewResult.projectsCount} repositories formatted</span>
              <span>SHA: {previewResult.sha ? previewResult.sha.slice(0, 7) : 'new file'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubSyncProfileReadmeProperties;
