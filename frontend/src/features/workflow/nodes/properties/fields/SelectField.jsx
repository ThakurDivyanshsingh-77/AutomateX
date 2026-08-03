import React from 'react';

export const SelectField = ({ label, value, onChange, options = [], error, description }) => {
  return (
    <div className="space-y-1.5 font-sans">
      <label className="block text-xs font-semibold text-slate-300">
        {label}
      </label>
      {description && <p className="text-[11px] text-slate-500">{description}</p>}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-100 font-mono font-bold focus:outline-none transition-colors ${
          error
            ? 'border-rose-500/80 focus:border-rose-500'
            : 'border-slate-800 focus:border-indigo-500'
        }`}
      >
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
    </div>
  );
};
