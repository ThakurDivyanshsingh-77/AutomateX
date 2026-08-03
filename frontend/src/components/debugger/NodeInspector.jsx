import React, { useState } from 'react';
import { Copy, Check, Code, ArrowDownRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const NodeInspector = ({ title, data }) => {
  const [copied, setCopied] = useState(false);

  const jsonString =
    data !== undefined && data !== null
      ? typeof data === 'object'
        ? JSON.stringify(data, null, 2)
        : String(data)
      : '{}';

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    toast.success(`${title} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1.5 font-sans">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Code className="w-3 h-3 text-indigo-400" />
          {title}
        </label>
        <button
          type="button"
          onClick={handleCopy}
          className="p-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy JSON'}
        </button>
      </div>

      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-60 overflow-y-auto">
        <pre>{jsonString}</pre>
      </div>
    </div>
  );
};
