import React from 'react';

export const Card = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden text-slate-900 transition-all ${
        hoverable ? 'hover:border-brand-500/50 hover:shadow-md' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};


