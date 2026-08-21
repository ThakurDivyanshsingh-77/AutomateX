import React from 'react';

export const Card = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div
      className={`glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden ${
        hoverable ? 'hover:border-brand-500/40 hover:shadow-glow-brand/20' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

