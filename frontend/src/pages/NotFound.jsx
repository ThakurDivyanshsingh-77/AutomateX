import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans select-none">
      <div className="text-center space-y-4 max-w-md">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">404 - Page Not Found</h1>
        <p className="text-xs text-slate-400">
          The requested page does not exist or has been moved.
        </p>
        <Link to="/dashboard" className="inline-block pt-2">
          <Button variant="primary">
            <Home className="w-4 h-4" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
