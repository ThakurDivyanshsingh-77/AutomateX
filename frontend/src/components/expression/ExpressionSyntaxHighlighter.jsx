import React from 'react';

/**
 * ExpressionSyntaxHighlighter.jsx
 * Tokenized syntax highlighting component for expressions.
 * Color codes:
 * - Variables: Purple
 * - Functions: Emerald
 * - Strings: Amber
 * - Numbers: Cyan
 * - Errors: Rose
 */
export const ExpressionSyntaxHighlighter = ({ text = '', unknownVars = [] }) => {
  if (!text || typeof text !== 'string') return null;

  // Split into tokens of literals and {{ ... }} expressions
  const parts = [];
  const regex = /(\{\{[\s\S]*?\}\})/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'literal', value: text.substring(lastIndex, match.index) });
    }

    const exprRaw = match[0];
    const exprContent = exprRaw.slice(2, -2).trim();

    // Classify expression type
    const isFn = exprContent.includes('(');
    const isUnknown = unknownVars.includes(exprContent);

    parts.push({
      type: 'expression',
      raw: exprRaw,
      content: exprContent,
      isFunction: isFn,
      isUnknown,
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'literal', value: text.substring(lastIndex) });
  }

  return (
    <span className="font-mono text-xs leading-relaxed inline-wrap">
      {parts.map((part, idx) => {
        if (part.type === 'literal') {
          return <span key={idx} className="text-slate-200">{part.value}</span>;
        }

        if (part.isUnknown) {
          return (
            <span
              key={idx}
              className="text-rose-400 font-bold bg-rose-500/10 border border-rose-500/30 px-1 py-0.5 rounded cursor-help"
              title={`Unknown variable: ${part.content}`}
            >
              {part.raw}
            </span>
          );
        }

        if (part.isFunction) {
          return (
            <span key={idx} className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded">
              {part.raw}
            </span>
          );
        }

        return (
          <span key={idx} className="text-purple-300 font-bold bg-purple-500/10 border border-purple-500/20 px-1 py-0.5 rounded">
            {part.raw}
          </span>
        );
      })}
    </span>
  );
};
