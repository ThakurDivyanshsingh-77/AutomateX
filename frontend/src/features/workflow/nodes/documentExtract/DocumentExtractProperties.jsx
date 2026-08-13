import React, { useState } from 'react';
import { ExpressionInput } from '../../../../components/expression/ExpressionInput';
import { FileSearch, Layers, Sparkles, Code2, HelpCircle } from 'lucide-react';

export const DocumentExtractProperties = ({ node, onUpdateNodeData }) => {
  const config = node.data?.config || {};
  const fileId = config.fileId || '{{steps["File → Upload Document"].file.id}}';
  const extractionMode = config.extractionMode || 'full';

  const handleFileIdChange = (value) => {
    onUpdateNodeData(node.id, {
      config: {
        ...config,
        fileId: value,
      },
    });
  };

  const handleModeChange = (e) => {
    onUpdateNodeData(node.id, {
      config: {
        ...config,
        extractionMode: e.target.value,
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Description Card */}
      <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 space-y-1">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
          <FileSearch className="w-4 h-4" />
          <span>Document → Extract Content</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Extract text, headings, tables, and document structure from uploaded files (.docx, .pdf, .xlsx, .doc).
        </p>
      </div>

      {/* Document Source File ID Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-200">
          Document Source File (File ID / Variable)
        </label>
        <ExpressionInput
          value={fileId}
          onChange={handleFileIdChange}
          placeholder='{{steps["File → Upload Document"].file.id}}'
          helperText="Map to the file ID returned by the File → Upload Document node."
        />
      </div>

      {/* Extraction Mode */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-200">
          Extraction Mode
        </label>
        <select
          value={extractionMode}
          onChange={handleModeChange}
          className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="full">Full Document (Text, Paragraphs, Headings & Tables)</option>
          <option value="textOnly">Text Only (Paragraphs & Headings)</option>
          <option value="tablesOnly">Tables Only (Extracted Tables)</option>
        </select>
        <p className="text-[10px] text-slate-400">
          Full Document extracts text, headings, structured tables, and ordered blocks for Phase 3 AI processing.
        </p>
      </div>

      {/* Output Variables Reference Card */}
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Code2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Available Output Paths</span>
        </div>
        <div className="space-y-1.5 font-mono text-[10px] text-slate-400">
          <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded border border-slate-850">
            <span className="text-indigo-300">.content.text</span>
            <span className="text-slate-500">Combined document text</span>
          </div>
          <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded border border-slate-850">
            <span className="text-indigo-300">.content.paragraphs</span>
            <span className="text-slate-500">Array of paragraphs</span>
          </div>
          <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded border border-slate-850">
            <span className="text-indigo-300">.content.headings</span>
            <span className="text-slate-500">Array of headings</span>
          </div>
          <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded border border-slate-850">
            <span className="text-indigo-300">.content.tables</span>
            <span className="text-slate-500">Array of tables</span>
          </div>
          <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded border border-slate-850">
            <span className="text-indigo-300">.content.blocks</span>
            <span className="text-slate-500">Ordered document blocks</span>
          </div>
        </div>
      </div>
    </div>
  );
};
