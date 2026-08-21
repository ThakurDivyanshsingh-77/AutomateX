import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      placeholder,
      className = '',
      icon: Icon,
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            className={`w-full bg-white border ${
              error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/15' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/15'
            } rounded-xl ${
              Icon ? 'pl-10' : 'px-3.5'
            } pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[11px] text-rose-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);


Input.displayName = 'Input';

