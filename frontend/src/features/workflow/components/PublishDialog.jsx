import React, { useState } from 'react';
import {
  X,
  Rocket,
  ChevronDown,
  Tag,
  FileText,
  Plus,
  Minus,
  Loader2,
  AlertCircle
} from 'lucide-react';

const BUMP_OPTIONS = [
  { value: 'minor', label: 'Minor', description: 'New features, workflow improvements' },
  { value: 'patch', label: 'Patch', description: 'Bug fixes, small corrections' },
  { value: 'major', label: 'Major', description: 'Breaking changes, major redesign' },
];

function computeNextVersion(current, bump) {
  if (!current) return 'v1.0.0';
  const clean = current.replace(/^v/, '');
  const [major = 1, minor = 0, patch = 0] = clean.split('.').map(Number);
  if (bump === 'major') return `v${major + 1}.0.0`;
  if (bump === 'patch') return `v${major}.${minor}.${patch + 1}`;
  return `v${major}.${minor + 1}.0`;
}

export const PublishDialog = ({ workflowId, currentVersion, onPublish, onClose }) => {
  const [bump, setBump] = useState('minor');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [changeSummary, setChangeSummary] = useState(['']);
  const [publishing, setPublishing] = useState(false);

  const nextVersion = computeNextVersion(currentVersion, bump);

  const addChangeItem = () => setChangeSummary((prev) => [...prev, '']);
  const removeChangeItem = (idx) => setChangeSummary((prev) => prev.filter((_, i) => i !== idx));
  const updateChangeItem = (idx, value) => setChangeSummary((prev) => prev.map((v, i) => (i === idx ? value : v)));

  const handlePublish = async () => {
    const filteredSummary = changeSummary.filter((s) => s.trim().length > 0);
    if (filteredSummary.length === 0) {
      filteredSummary.push(`Published ${nextVersion}`);
    }

    setPublishing(true);
    try {
      await onPublish({
        bump,
        title: title.trim() || `Version ${nextVersion}`,
        description: description.trim(),
        changeSummary: filteredSummary,
      });
      onClose();
    } catch (err) {
      // Parent handles toast
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/20">
              <Rocket className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Publish New Version</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Create a permanent snapshot of this workflow
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Version Preview Bar */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Current:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {currentVersion || 'Unpublished'}
            </span>
          </div>
          <span className="text-slate-600">→</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">New:</span>
            <span className="px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold">
              {nextVersion}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Version Bump Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Version Bump Type</label>
            <div className="grid grid-cols-3 gap-2">
              {BUMP_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBump(opt.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    bump === opt.value
                      ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="text-xs font-bold mb-0.5">{opt.label}</div>
                  <div className="text-[10px] leading-relaxed opacity-70">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Version Title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Version Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Version ${nextVersion}`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Change Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">What's new in this version?</label>
              <button
                onClick={addChangeItem}
                className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                <Plus className="w-3 h-3" /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {changeSummary.map((change, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={change}
                    onChange={(e) => updateChangeItem(idx, e.target.value)}
                    placeholder={`e.g. Added Gmail integration`}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {changeSummary.length > 1 && (
                    <button
                      onClick={() => removeChangeItem(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description (optional) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Description <span className="text-slate-600 font-normal">(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Additional context for this version..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-500/70" />
            This will update the live workflow used by all automations
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-4 py-2 text-xs text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-60"
            >
              {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
              Publish {nextVersion}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
