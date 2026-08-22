import React, { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Heart, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PERKS = [
  { icon: GlobeIcon, title: '100% Remote-First', desc: 'Work from anywhere in the world. Flexible hours and asynchronous culture.' },
  { icon: DollarSign, title: 'Top-Tier Pay & Equity', desc: 'Competitive Silicon Valley compensation benchmarks and meaningful equity grants.' },
  { icon: Sparkles, title: '$5,000 Workspace Budget', desc: 'Set up your dream workstation with top-tier hardware, displays, and ergonomic chairs.' },
  { icon: Heart, title: 'Health & Wellness', desc: 'Comprehensive medical, dental, vision, and mental wellness coverage for you and your family.' },
];

function GlobeIcon(props) {
  return <Briefcase {...props} />;
}

const JOBS = [
  {
    id: 1,
    title: 'Senior Distributed Systems Engineer',
    dept: 'Engineering',
    location: 'Remote (Global)',
    type: 'Full-time',
    description: 'Scale our real-time BullMQ / Redis execution scheduler and optimize node execution throughput to 100k+ events/sec.',
  },
  {
    id: 2,
    title: 'AI Systems & Agent Architect',
    dept: 'AI Research',
    location: 'Remote (US / EU / APAC)',
    type: 'Full-time',
    description: 'Lead the development of autonomous workflow synthesis, dynamic LLM routers, and AST schema auto-repair engines.',
  },
  {
    id: 3,
    title: 'Senior Frontend Engineer (React / Canvas)',
    dept: 'Engineering',
    location: 'Remote (Global)',
    type: 'Full-time',
    description: 'Craft fluid, 120 FPS node graph experiences using React Flow, custom SVG renderers, and micro-animations.',
  },
  {
    id: 4,
    title: 'Staff Product Designer',
    dept: 'Product & Design',
    location: 'Remote (Global)',
    type: 'Full-time',
    description: 'Define the visual aesthetics, design tokens, and user experience for the next generation of automation tools.',
  },
  {
    id: 5,
    title: 'Developer Relations & Technical Writer',
    dept: 'Growth',
    location: 'Remote (US / EU)',
    type: 'Full-time',
    description: 'Create exceptional code blueprints, write deep-dive engineering tutorials, and engage with our open-source community.',
  },
];

export function CareersPage() {
  const [selectedDept, setSelectedDept] = useState('All');
  const [activeJobModal, setActiveJobModal] = useState(null);
  const [applied, setApplied] = useState(false);
  const [appData, setAppData] = useState({ name: '', email: '', portfolio: '' });

  const filteredJobs = selectedDept === 'All'
    ? JOBS
    : JOBS.filter(j => j.dept === selectedDept);

  const handleApply = (e) => {
    e.preventDefault();
    setApplied(true);
    toast.success('Application submitted! We will review your profile within 48 hours.');
  };

  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Briefcase className="w-3.5 h-3.5" /> Join AutomateX
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-6" style={{ color: '#1A1012' }}>
          Build tools that empower <span style={{ color: '#ff4f00' }}>millions of developers</span>
        </h1>
        <p className="text-lg text-ink-body max-w-2xl mx-auto" style={{ color: '#5C5050' }}>
          We are a team of passionate engineers, designers, and systems architects building high-impact automation infrastructure.
        </p>
      </div>

      {/* Perks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {PERKS.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} className="p-6 rounded-3xl border border-cream-border bg-white shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">{p.title}</h3>
              <p className="text-xs text-ink-body leading-relaxed">{p.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Open Positions Section */}
      <div className="mb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-ink mb-1">Open Positions ({filteredJobs.length})</h2>
            <p className="text-sm text-ink-body">Find your next mission at AutomateX.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {['All', 'Engineering', 'AI Research', 'Product & Design', 'Growth'].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDept(d)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedDept === d
                    ? 'bg-ink text-white shadow-xs'
                    : 'bg-cream-soft text-ink-body hover:text-ink'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map(job => (
            <div
              key={job.id}
              onClick={() => {
                setActiveJobModal(job);
                setApplied(false);
              }}
              className="p-6 rounded-2xl border border-cream-border bg-white hover:border-orange-500 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-cream text-orange-600">
                    {job.dept}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">{job.location}</span>
                </div>
                <h3 className="text-lg font-bold text-ink group-hover:text-orange-600 transition-colors">
                  {job.title}
                </h3>
                <p className="text-xs text-ink-body mt-1 max-w-2xl">{job.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Apply Now <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job Application Modal */}
      {activeJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-cream-border shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">{activeJobModal.dept}</span>
              <button onClick={() => setActiveJobModal(null)} className="text-gray-400 hover:text-ink font-bold text-lg p-1">✕</button>
            </div>

            <h3 className="text-2xl font-bold text-ink mb-2">{activeJobModal.title}</h3>
            <p className="text-xs text-ink-body mb-6">{activeJobModal.description}</p>

            {applied ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-900">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="font-bold text-lg">Application Submitted!</h4>
                <p className="text-xs text-emerald-800 mt-1">Thank you {appData.name}. Our recruiting team will review your details shortly.</p>
                <button
                  onClick={() => setActiveJobModal(null)}
                  className="mt-4 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Jordan Lee"
                    value={appData.name}
                    onChange={e => setAppData({ ...appData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="jordan@example.com"
                    value={appData.email}
                    onChange={e => setAppData({ ...appData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">GitHub / LinkedIn / Portfolio URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={appData.portfolio}
                    onChange={e => setAppData({ ...appData, portfolio: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  >
                    Submit Application
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveJobModal(null)}
                    className="px-4 py-3 rounded-xl font-semibold text-sm border border-cream-border text-ink hover:bg-cream"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CareersPage;
