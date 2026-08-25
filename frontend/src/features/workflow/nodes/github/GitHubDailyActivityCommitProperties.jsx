import React, { useState, useEffect } from 'react';
import { 
  GitCommit, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Key,
  FolderGit2,
  Clock,
  Sparkles
} from 'lucide-react';
import api from '../../../../services/api';
import { credentialService } from '../../../credentials/services/credentialService';

const GitHubDailyActivityCommitProperties = ({ node, updateNodeData }) => {
  const config = node?.data?.config || {};

  const [credentials, setCredentials] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [testing, setTesting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch GitHub credentials
  useEffect(() => {
    const fetchCreds = async () => {
      setLoadingCreds(true);
      try {
        const creds = await credentialService.getCredentialsByService('github');
        setCredentials(creds || []);
        if (creds?.length > 0 && !config.credentialId) {
          handleChange('credentialId', creds[0]._id || creds[0].id);
        }
      } catch (err) {
        console.warn('Failed to load GitHub credentials:', err);
      } finally {
        setLoadingCreds(false);
      }
    };
    fetchCreds();
  }, []);

  const handleChange = (key, value) => {
    updateNodeData(node.id, {
      ...node.data,
      config: {
        ...config,
        [key]: value,
      },
    });
  };

  // Dry-run preview
  const handleTestPreview = async () => {
    setTesting(true);
    setErrorMsg(null);
    setPreviewResult(null);

    try {
      const response = await api.post('/github/activity/preview', {
        config: {
          ...config,
          dryRun: true,
        },
      });
      setPreviewResult(response.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to preview activity commit.');
    } finally {
      setTesting(false);
    }
  };

  // Immediate execution
  const handleApplyCommit = async () => {
    if (!window.confirm('Are you sure you want to commit today\'s activity to GitHub now?')) {
      return;
    }

    setApplying(true);
    setErrorMsg(null);

    try {
      const response = await api.post('/github/activity/apply', {
        config: {
          ...config,
          dryRun: false,
        },
      });
      setPreviewResult(response.data);
      alert(response.data.committed 
        ? `✅ Success! Activity commit created: ${response.data.commitSha?.slice(0, 7)}` 
        : `ℹ️ ${response.data.reason || 'Today\'s activity is already completed.'}`
      );
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to commit activity.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-5 text-slate-200">
      {/* Header Banner */}
      <div className="rounded-xl border border-violet-800/40 bg-gradient-to-br from-violet-950/40 to-slate-900/60 p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-violet-300 font-medium text-xs">
          <GitCommit className="h-4 w-4 text-violet-400" />
          <span>Daily Automation Heartbeat</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Records a real daily activity commit to your GitHub repository once per day. Includes daily deduplication so multiple workflow executions never spam or duplicate entries.
        </p>
      </div>

      {/* GitHub Authentication */}
      <div className="space-y-2">
        <label className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5 text-violet-400" />
            GitHub Connection
          </span>
          {loadingCreds && <span className="text-[10px] text-slate-500">Loading...</span>}
        </label>
        <select
          value={config.credentialId || ''}
          onChange={(e) => handleChange('credentialId', e.target.value)}
          className="w-full rounded-lg border border-slate-700/80 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
        >
          <option value="">-- Select GitHub Credential --</option>
          {credentials.map((cred) => (
            <option key={cred._id || cred.id} value={cred._id || cred.id}>
              {cred.name || cred.label || `GitHub (${cred.service})`}
            </option>
          ))}
        </select>
      </div>

      {/* Target Repository */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <FolderGit2 className="h-3.5 w-3.5 text-violet-400" />
          Target Repository <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={config.repository || config.profileRepo || ''}
          onChange={(e) => handleChange('repository', e.target.value)}
          placeholder="e.g. username/automatex-activity"
          className="w-full rounded-lg border border-slate-700/80 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none placeholder:text-slate-600"
        />
        <p className="text-[10px] text-slate-500">
          Format: <code className="text-violet-400">username/repository</code>
        </p>
      </div>

      {/* Branch & Activity File Path */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-400">Branch</label>
          <input
            type="text"
            value={config.branch || 'main'}
            onChange={(e) => handleChange('branch', e.target.value)}
            className="w-full rounded-lg border border-slate-700/80 bg-slate-950 px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:border-violet-500 outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-400">Timezone</label>
          <select
            value={config.timezone || 'UTC'}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="w-full rounded-lg border border-slate-700/80 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-violet-500 outline-none"
          >
            <option value="UTC">UTC (Default)</option>
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <FileText className="h-3.5 w-3.5 text-violet-400" />
          Activity File Path
        </label>
        <input
          type="text"
          value={config.activityFile || '.github/automatex/activity.md'}
          onChange={(e) => handleChange('activityFile', e.target.value)}
          placeholder=".github/automatex/activity.md"
          className="w-full rounded-lg border border-slate-700/80 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none placeholder:text-slate-600"
        />
      </div>

      {/* Commit Message & Activity Description */}
      <div className="space-y-3 pt-1 border-t border-slate-800/80">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Commit Message</label>
          <input
            type="text"
            value={config.commitMessage || 'chore: daily AutomateX activity'}
            onChange={(e) => handleChange('commitMessage', e.target.value)}
            className="w-full rounded-lg border border-slate-700/80 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-violet-500 outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Entry Description</label>
          <input
            type="text"
            value={config.activityDescription || 'AutomateX daily automation heartbeat'}
            onChange={(e) => handleChange('activityDescription', e.target.value)}
            className="w-full rounded-lg border border-slate-700/80 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-violet-500 outline-none"
          />
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <div>
              <div className="text-xs font-medium text-slate-200">Daily Deduplication</div>
              <div className="text-[10px] text-slate-500">Skip commit if today is already logged</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.dailyDeduplication !== false}
            onChange={(e) => handleChange('dailyDeduplication', e.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500"
          />
        </label>

        <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <div>
              <div className="text-xs font-medium text-slate-200">Dry Run Mode</div>
              <div className="text-[10px] text-slate-500">Simulate changes without committing to Git</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={Boolean(config.dryRun)}
            onChange={(e) => handleChange('dryRun', e.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500"
          />
        </label>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-3 border-t border-slate-800">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleTestPreview}
            disabled={testing}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-violet-700/60 bg-violet-950/40 px-3 py-2 text-xs font-medium text-violet-300 hover:bg-violet-900/60 transition-colors disabled:opacity-50"
          >
            {testing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Test Preview
          </button>

          <button
            type="button"
            onClick={handleApplyCommit}
            disabled={applying}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-md hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50"
          >
            {applying ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Apply to GitHub
          </button>
        </div>
      </div>

      {/* Error / Feedback Alert */}
      {errorMsg && (
        <div className="rounded-lg border border-rose-800/60 bg-rose-950/30 p-2.5 flex items-start gap-2 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preview Output Drawer */}
      {previewResult && (
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span>Result:</span>
            <span className={previewResult.committed || previewResult.wouldCommit ? 'text-emerald-400' : 'text-slate-400'}>
              {previewResult.committed
                ? '✅ Committed to Git'
                : previewResult.alreadyCompleted
                ? 'ℹ️ Already completed today'
                : previewResult.wouldCommit
                ? '🔍 Dry Run: Would Commit'
                : 'No change'}
            </span>
          </div>

          <div className="rounded bg-slate-900 p-2 font-mono text-[10px] text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
            {previewResult.proposedContent || JSON.stringify(previewResult, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubDailyActivityCommitProperties;
