import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ text = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center gap-3 text-indigo-400 font-semibold text-xs">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>{text}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 gap-2 text-indigo-400 text-xs font-semibold">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>{text}</span>
    </div>
  );
};
