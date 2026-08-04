import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code, Sparkles, PlusCircle } from 'lucide-react';

export const VariablePreviewModal = ({ isOpen, onClose, variableItem, onInsert }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !variableItem) return null;

  const path = variableItem.path || '';
  const expr = `{{${path}}}`;
  const rawValue = variableItem.value !== undefined ? variableItem.value : variableItem.example;
  const jsonString = typeof rawValue === 'object' ? JSON.stringify(rawValue, null, 2) : String(rawValue ?? '');

  const handleCopy = () => {
    navigator.clipboard.writeText(expr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100">Variable Inspector & Preview</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
          {/* Metadata Bar */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Name</span>
              <span className="font-mono font-bold text-slate-200 text-sm">{variableItem.name}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Data Type</span>
              <span className="font-mono font-bold text-indigo-400 uppercase">{variableItem.type || 'String'}</span>
            </div>
          </div>

          {/* Variable Expression Path */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Variable Expression Path</label>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 font-mono text-purple-300 font-bold">
              <span>{expr}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-2 py-1 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Description */}
          {variableItem.description && (
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Description</label>
              <p className="text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">{variableItem.description}</p>
            </div>
          )}

          {/* Value Preview / Raw JSON */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                <Terminal className="w-3 h-3 text-emerald-400" /> Sample / Resolved Value
              </label>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap max-h-48">
              {jsonString}
            </pre>
          </div>

          {/* Usage Code Snippets */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
              <Code className="w-3 h-3 text-indigo-400" /> Transformation Code Examples
            </label>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-300 flex justify-between">
                <span>Uppercase: <span className="text-purple-300">{`{{upper(${path})}}`}</span></span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-300 flex justify-between">
                <span>Ternary IF: <span className="text-purple-300">{`{{if(${path}, "TrueVal", "FalseVal")}}`}</span></span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-300 flex justify-between">
                <span>Fallback: <span className="text-purple-300">{`{{${path} | "Default"}}`}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
          >
            Close
          </button>

          {onInsert && (
            <button
              type="button"
              onClick={() => {
                onInsert(expr);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Insert Variable</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
