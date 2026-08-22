import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Heart, Shield, Cpu, Users, Award, Globe2, ArrowRight } from 'lucide-react';

const STATS = [
  { label: 'Monthly Executions', value: '50M+' },
  { label: 'Pre-built Connectors', value: '100+' },
  { label: 'Uptime SLA', value: '99.99%' },
  { label: 'Developers & Teams', value: '14,000+' },
];

const VALUES = [
  {
    icon: Zap,
    title: 'Developer Autonomy',
    desc: 'No artificial walled gardens. Write code when you need to, visually orchestrate when you want speed.',
  },
  {
    icon: Shield,
    title: 'Zero-Loss Reliability',
    desc: 'Every payload is precious. Dead letter queues and self-healing retries are foundational, not afterthoughts.',
  },
  {
    icon: Cpu,
    title: 'AI-Native Orchestration',
    desc: 'Empowering engineers to weave LLM reasoning seamlessly into deterministic business logic.',
  },
  {
    icon: Heart,
    title: 'Craft & Performance',
    desc: 'Obsession with sub-millisecond execution latency, fluid canvas rendering, and thoughtful UI details.',
  },
];

const TEAM = [
  {
    name: 'Divyansh Singh',
    role: 'Founder & Chief Architect',
    bio: 'Distributed systems engineer focused on high-throughput event queues and visual programming paradigms.',
  },
  {
    name: 'Elena Rostova',
    role: 'Head of AI Engineering',
    bio: 'Former ML researcher specializing in autonomous multi-agent systems and LLM schema validation.',
  },
  {
    name: 'Marcus Vance',
    role: 'VP of Platform Infrastructure',
    bio: 'Scales cloud infrastructure and zero-trust security vaults across multi-region clusters.',
  },
  {
    name: 'Sarah Jenkins',
    role: 'Head of Product & Design',
    bio: 'Passionate about crafting developer tools that feel magical, frictionless, and visually inspiring.',
  },
];

export function AboutPage() {
  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Zap className="w-3.5 h-3.5" /> Our Mission
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-6" style={{ color: '#1A1012' }}>
          We are building the universal engine for <span style={{ color: '#ff4f00' }}>modern automation</span>
        </h1>
        <p className="text-lg text-ink-body max-w-2xl mx-auto" style={{ color: '#5C5050' }}>
          AutomateX was founded on a simple premise: automation tools shouldn't force developers to choose between brittle visual toys and heavy custom microservices.
        </p>
      </div>

      {/* Stats Band */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-8 rounded-3xl bg-ink text-white mb-20 shadow-xl text-center">
        {STATS.map((s, i) => (
          <div key={i}>
            <div className="text-3xl sm:text-4xl font-black text-orange-400 mb-1">{s.value}</div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Origin Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-2 block">Our Origin Story</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-6">Born from the frustration of glue code & dropped webhooks</h2>
          <p className="text-sm sm:text-base text-ink-body leading-relaxed mb-4">
            Engineers spend thousands of hours writing boilerplate webhook listeners, retry mechanisms, and OAuth refresh logic for third-party APIs. When downstream services flicker, payloads disappear into the void.
          </p>
          <p className="text-sm sm:text-base text-ink-body leading-relaxed">
            AutomateX bridges the gap: a visual canvas backed by an enterprise execution runtime with built-in dead letter queues, code-native flexibility, and deep AI intelligence.
          </p>
        </div>

        <div className="rounded-3xl p-8 bg-cream-soft border border-cream-border space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-cream-border shadow-xs">
            <h4 className="font-bold text-ink text-sm mb-1">⚡ Fast & Visual</h4>
            <p className="text-xs text-ink-body">Sub-millisecond interactive node graph with live execution inspection.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-cream-border shadow-xs">
            <h4 className="font-bold text-ink text-sm mb-1">🛡️ Resilient by Design</h4>
            <p className="text-xs text-ink-body">Zero payload drops with automatic dead-letter recovery queues.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-cream-border shadow-xs">
            <h4 className="font-bold text-ink text-sm mb-1">🧠 AI-Augmented</h4>
            <p className="text-xs text-ink-body">Prompt-to-pipeline generation with automatic schema error repair.</p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-ink mb-2">Our Operating Values</h2>
          <p className="text-sm text-ink-body">The core principles that guide our product engineering and team decisions.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="p-6 rounded-3xl border border-cream-border bg-white shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">{v.title}</h3>
                <p className="text-xs text-ink-body leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Grid */}
      <div className="mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-ink mb-2">Meet the Leadership Team</h2>
          <p className="text-sm text-ink-body">Engineers, designers, and researchers passionate about developer tooling.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member, i) => (
            <div key={i} className="p-6 rounded-3xl border border-cream-border bg-white text-center shadow-xs">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="font-bold text-ink text-base">{member.name}</h3>
              <div className="text-xs font-semibold text-orange-600 mb-3">{member.role}</div>
              <p className="text-xs text-ink-body leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Join CTA */}
      <div className="rounded-3xl p-8 sm:p-12 text-center bg-orange-500 text-white">
        <h2 className="text-3xl font-bold mb-3">Want to shape the future of automation?</h2>
        <p className="text-orange-100 max-w-xl mx-auto mb-8 text-sm">
          We are hiring distributed systems engineers, product designers, and AI researchers across the globe.
        </p>
        <Link
          to="/careers"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-white text-orange-600 hover:bg-orange-50 shadow-md transition-all"
        >
          View Open Careers <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default AboutPage;
