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
          <label className="block text-xs font-semibold text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            className={`w-full bg-slate-950 border ${
              error ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
            } rounded-xl ${
              Icon ? 'pl-10' : 'px-3.5'
            } pr-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[11px] text-rose-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
