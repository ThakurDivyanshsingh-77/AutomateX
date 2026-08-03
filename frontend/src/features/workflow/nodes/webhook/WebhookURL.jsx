import React, { useState } from 'react';
import { Copy, Check, Globe, Link } from 'lucide-react';
import toast from 'react-hot-toast';

export const WebhookURL = ({ webhookUrl }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success('Webhook URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1.5 font-sans">
      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        Generated Webhook Endpoint URL
      </label>

      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2 font-mono text-xs">
        <Globe className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 ml-1" />
        <span className="flex-1 truncate text-slate-200 select-all font-medium">
          {webhookUrl}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 px-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-semibold flex items-center gap-1 border border-blue-500/20 transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
};
