import React, { useState } from 'react';
import { Copy, Check, Sparkles, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

export const VariablePreview = ({ selectedPath, sampleValue, onInsert }) => {
  const [copied, setCopied] = useState(false);

  if (!selectedPath) {
    return (
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center gap-2">
        <Terminal className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
        <span>Click any property in the tree to preview and insert expression.</span>
      </div>
    );
  }

  const expressionText = `{{${selectedPath}}}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(expressionText);
    setCopied(true);
    toast.success(`Copied ${expressionText}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleDisplay =
    sampleValue !== undefined && sampleValue !== null
      ? typeof sampleValue === 'object'
        ? JSON.stringify(sampleValue)
        : String(sampleValue)
      : 'undefined';

  return (
    <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Expression:
          </span>
          <code className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg truncate">
            {expressionText}
          </code>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Preview Value:
          </span>
          <span className="text-emerald-400 font-mono truncate font-medium">
            {sampleDisplay}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>

        <button
          type="button"
          onClick={() => onInsert(expressionText)}
          className="p-1.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Insert Expression
        </button>
      </div>
    </div>
  );
};
