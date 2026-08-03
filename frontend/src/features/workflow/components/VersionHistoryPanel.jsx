import React, { useEffect, useState, useCallback } from 'react';
import {
  X,
  GitBranch,
  CheckCircle2,
  Clock,
  RotateCcw,
  GitCompare,
  Loader2,
  Trash2,
  Tag,
  ChevronRight,
  Rocket,
  FileEdit,
  History
} from 'lucide-react';
import { versionService } from '../services/versionService';
import toast from 'react-hot-toast';

export const VersionHistoryPanel = ({ workflowId, currentVersion, onClose, onRestore, onCompare, onPublish }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringVersion, setRestoringVersion] = useState(null);
  const [deletingDraft, setDeletingDraft] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState([]);

  const fetchVersions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await versionService.getVersions(workflowId);
      setVersions(res.versions || []);
    } catch (err) {
      toast.error('Failed to load version history');
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleRestore = async (versionTag) => {
    if (!window.confirm(`Restore to ${versionTag}? This will create a new rollback version and update the live workflow.`)) return;
    setRestoringVersion(versionTag);
    try {
      await onRestore(versionTag);
      toast.success(`Restored to ${versionTag}! New rollback version created.`);
      fetchVersions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Restore failed');
    } finally {
      setRestoringVersion(null);
    }
  };

  const handleDeleteDraft = async () => {
    if (!window.confirm('Delete current draft? This cannot be undone.')) return;
    setDeletingDraft(true);
    try {
      await versionService.deleteDraft(workflowId);
      toast.success('Draft deleted');
      fetchVersions();
    } catch (err) {
      toast.error('Failed to delete draft');
    } finally {
      setDeletingDraft(false);
    }
  };

  const handleToggleCompareSelect = (versionTag) => {
    setSelectedVersions((prev) => {
      if (prev.includes(versionTag)) return prev.filter((v) => v !== versionTag);
      if (prev.length >= 2) return [prev[1], versionTag];
      return [...prev, versionTag];
    });
  };

  const handleCompare = () => {
    if (selectedVersions.length < 2) {
      toast.error('Select exactly 2 versions to compare');
      return;
    }
    onCompare(selectedVersions[0], selectedVersions[1]);
  };

  const getStatusBadge = (status, isRollback) => {
    if (status === 'draft') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
          <FileEdit className="w-2.5 h-2.5" /> DRAFT
        </span>
      );
    }
    if (status === 'published') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
          <CheckCircle2 className="w-2.5 h-2.5" /> PUBLISHED
          {isRollback && <span className="ml-1 opacity-70">(Rollback)</span>}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
        {status}
      </span>
    );
  };

  const publishedVersions = versions.filter((v) => v.status !== 'draft');
  const draftVersion = versions.find((v) => v.status === 'draft');

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-sm h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <History className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Version History</h3>
              <p className="text-[10px] text-slate-500">
                {versions.length} version{versions.length !== 1 ? 's' : ''} · Current:{' '}
                <span className="font-mono text-indigo-400">{currentVersion || 'Unpublished'}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compare toolbar — shown when 2 versions selected */}
        {selectedVersions.length >= 2 && (
          <div className="px-4 py-2 bg-indigo-600/10 border-b border-indigo-600/20 flex items-center justify-between">
            <span className="text-[11px] text-indigo-300 font-semibold">
              {selectedVersions[0]} vs {selectedVersions[1]}
            </span>
            <button
              onClick={handleCompare}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5" /> Compare
            </button>
          </div>
        )}

        {selectedVersions.length === 1 && (
          <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-800 text-[11px] text-slate-400">
            Select one more version to compare
          </div>
        )}

        {/* Publish Button */}
        <div className="p-3 border-b border-slate-800">
          <button
            onClick={onPublish}
            className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Rocket className="w-4 h-4" /> Publish New Version
          </button>
        </div>

        {/* Version List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              Loading version history...
            </div>
          ) : versions.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
              <GitBranch className="w-8 h-8 text-slate-700" />
              <span>No versions yet.</span>
              <span className="text-slate-600">Publish to create the first version.</span>
            </div>
          ) : (
            <>
              {/* Draft card (pinned at top) */}
              {draftVersion && (
                <div className="p-3 rounded-xl border border-amber-500/25 bg-amber-500/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        {getStatusBadge('draft', false)}
                        <span className="text-[10px] font-mono text-slate-500">{draftVersion.version}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Unsaved changes — not live</p>
                    </div>
                    <button
                      onClick={handleDeleteDraft}
                      disabled={deletingDraft}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="Delete Draft"
                    >
                      {deletingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Published/Archived versions */}
              {publishedVersions.map((v, idx) => {
                const isCurrentPublished = v.version === currentVersion;
                const isCompareSelected = selectedVersions.includes(v.version);

                return (
                  <div
                    key={v._id || v.version}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrentPublished
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : isCompareSelected
                        ? 'border-indigo-500/40 bg-indigo-500/5'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    {/* Version Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-slate-100">{v.version}</span>
                        {getStatusBadge(v.status, v.isRollback)}
                        {isCurrentPublished && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                            LIVE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    {v.title && (
                      <p className="text-[11px] font-semibold text-slate-200 mb-1 truncate">{v.title}</p>
                    )}

                    {/* Change Summary */}
                    {v.changeSummary && v.changeSummary.length > 0 && (
                      <ul className="space-y-0.5 mb-2">
                        {v.changeSummary.slice(0, 3).map((change, i) => (
                          <li key={i} className="text-[10px] text-slate-400 truncate">
                            {change}
                          </li>
                        ))}
                        {v.changeSummary.length > 3 && (
                          <li className="text-[10px] text-slate-500">+{v.changeSummary.length - 3} more changes</li>
                        )}
                      </ul>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(v.publishedAt || v.createdAt).toLocaleDateString()}
                      </span>
                      {v.createdBy?.name && (
                        <span className="truncate max-w-[100px]">by {v.createdBy.name}</span>
                      )}
                      <span>{v.definition?.nodes?.length || 0} nodes</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      {/* Compare Select Toggle */}
                      <button
                        onClick={() => handleToggleCompareSelect(v.version)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-semibold border transition-colors flex items-center justify-center gap-1 ${
                          isCompareSelected
                            ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <GitCompare className="w-3 h-3" /> Compare
                      </button>

                      {/* Restore Button (only for non-current versions) */}
                      {!isCurrentPublished && (
                        <button
                          onClick={() => handleRestore(v.version)}
                          disabled={restoringVersion === v.version}
                          className="flex-1 py-1 rounded-lg text-[10px] font-semibold border border-indigo-500/20 bg-indigo-600/10 text-indigo-300 hover:bg-indigo-600/20 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {restoringVersion === v.version ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer — Hint */}
        <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
          Versions are permanent snapshots. Restoring creates a new version and never overwrites history.
        </div>
      </div>
    </div>
  );
};
