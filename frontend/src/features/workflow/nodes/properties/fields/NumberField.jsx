import React from 'react';

export const NumberField = ({ label, value, onChange, min, max, error, description }) => {
  return (
    <div className="space-y-1.5 font-sans">
      <label className="block text-xs font-semibold text-slate-300">
        {label}
      </label>
      {description && <p className="text-[11px] text-slate-500">{description}</p>}
      <input
        type="number"
        min={min}
        max={max}
        value={value !== undefined ? value : ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none transition-colors ${
          error
            ? 'border-rose-500/80 focus:border-rose-500'
            : 'border-slate-800 focus:border-indigo-500'
        }`}
      />
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
    </div>
  );
};
