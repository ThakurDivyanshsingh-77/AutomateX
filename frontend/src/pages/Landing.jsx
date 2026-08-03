import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Zap, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center items-center text-center p-6 relative overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -top-40" />

        <div className="max-w-3xl space-y-6 z-10 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 fill-indigo-400" />
            <span>Phase 1 Complete - Production Auth Ready</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Enterprise Modular <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Workflow Automation Platform
            </span>
          </h1>

          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Visually design, automate, and orchestrate complex integrations. Built with Express, MongoDB, JWT authentication, and a clean layered architecture.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Link to="/register">
              <Button variant="primary" size="lg">
                Create Account <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-16 z-10">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left space-y-2">
            <div className="p-2.5 rounded-xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">JWT Security</h3>
            <p className="text-xs text-slate-400">bcrypt password hashing, express-validator sanitization, and 401 response interceptors.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left space-y-2">
            <div className="p-2.5 rounded-xl bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 w-fit">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Layered Architecture</h3>
            <p className="text-xs text-slate-400">Strict single responsibility principle across presentation, services, controllers, and models.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left space-y-2">
            <div className="p-2.5 rounded-xl bg-purple-600/10 border border-purple-600/20 text-purple-400 w-fit">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Linear SaaS Aesthetic</h3>
            <p className="text-xs text-slate-400">Modern dark palette, rounded corners, soft ambient shadows, and responsive design.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
