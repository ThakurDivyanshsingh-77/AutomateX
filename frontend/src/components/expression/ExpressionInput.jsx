import React, { useState, useRef } from 'react';
import { Sparkles, Terminal, HelpCircle } from 'lucide-react';
import { VariablePickerModal } from './VariablePickerModal';

// Sample mock lookup for live preview in frontend editor
const SAMPLE_MOCK_DATA = {
  'http.statusCode': 200,
  'http.statusText': 'OK',
  'http.data.id': 101,
  'http.data.name': 'Divyansh',
  'http.data.email': 'divyansh@example.com',
  'http.data.user.address.city': 'Jaipur',
  'http.data.items[0].name': 'Laptop',
  'gmail.messageId': '18ab4d8d90ef',
  'gmail.status': 'SENT',
  'logger.message': 'Workflow log payload output',
  'start.triggeredAt': '2026-07-30T10:00:00.000Z',
};

export const ExpressionInput = ({
  label,
  value = '',
  onChange,
  placeholder,
  isTextarea = false,
  rows = 3,
  error,
  description,
  required = false,
  workflowNodes = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef(null);

  // Insert variable expression at exact cursor position
  const handleInsertExpression = (exprText) => {
    const el = inputRef.current;
    if (!el) {
      onChange((value || '') + exprText);
      return;
    }

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const currentVal = value || '';

    const nextVal = currentVal.substring(0, start) + exprText + currentVal.substring(end);
    onChange(nextVal);

    // Reposition cursor after inserted expression
    setTimeout(() => {
      el.focus();
      const newPos = start + exprText.length;
      el.setSelectionRange(newPos, newPos);
    }, 50);
  };

  // Keyboard shortcut listener: Ctrl + Space opens Variable Picker
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  // Generate live sample preview if string contains {{ ... }}
  const hasExpression = typeof value === 'string' && value.includes('{{');
  let livePreviewText = '';

  if (hasExpression) {
    livePreviewText = value.replace(/\{\{\s*(.*?)\s*\}\}/g, (match, path) => {
      const trimmedPath = path.trim();
      if (SAMPLE_MOCK_DATA[trimmedPath] !== undefined) {
        return SAMPLE_MOCK_DATA[trimmedPath];
      }
      // Check prefix/fuzzy lookup
      for (const [k, v] of Object.entries(SAMPLE_MOCK_DATA)) {
        if (k.endsWith(`.${trimmedPath}`) || k === trimmedPath) {
          return String(v);
        }
      }
      return '[Unknown Variable]';
    });
  }

  const InputTag = isTextarea ? 'textarea' : 'input';

  return (
    <div className="space-y-1.5 font-sans">
      {/* Label and Insert Variable Action Button */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-xs font-semibold text-slate-300">
            {label} {required && <span className="text-amber-400">*</span>}
          </label>
        )}

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
          title="Press Ctrl + Space to open Variable Picker"
        >
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Insert Variable</span>
        </button>
      </div>

      {description && <p className="text-[11px] text-slate-500">{description}</p>}

      {/* Input / Textarea Field */}
      <div className="relative">
        <InputTag
          ref={inputRef}
          type={isTextarea ? undefined : 'text'}
          rows={isTextarea ? rows : undefined}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none transition-colors ${
            hasExpression
              ? 'border-purple-500/60 focus:border-purple-500 text-purple-200'
              : error
              ? 'border-rose-500/80 focus:border-rose-500'
              : 'border-slate-800 focus:border-indigo-500'
          }`}
        />
      </div>

      {/* Live Resolved Preview Banner */}
      {hasExpression && (
        <div className="p-2 px-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[10px] font-mono flex items-center gap-2 text-purple-300">
          <Terminal className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />
          <div className="truncate">
            <span className="font-bold uppercase tracking-wider text-purple-400 mr-1.5">Live Preview:</span>
            <span>{livePreviewText}</span>
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}

      {/* Variable Picker Modal */}
      <VariablePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInsert={handleInsertExpression}
        workflowNodes={workflowNodes}
      />
    </div>
  );
};
