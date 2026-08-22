import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Mail, Terminal, LifeBuoy, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export function SupportPage() {
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Workflow Execution Issue',
    priority: 'Medium',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const generatedId = `TICK-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(generatedId);
    setTicketSubmitted(true);
    toast.success(`Support ticket ${generatedId} created successfully!`);
  };

  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <LifeBuoy className="w-3.5 h-3.5" /> 24/7 Developer Support
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-6" style={{ color: '#1A1012' }}>
          How can we help you <span style={{ color: '#ff4f00' }}>today?</span>
        </h1>
        <p className="text-lg text-ink-body max-w-2xl mx-auto" style={{ color: '#5C5050' }}>
          Our engineering support team is available around the clock to troubleshoot workflows, review payloads, and unblock your team.
        </p>
      </div>

      {/* Support Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="p-8 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-2">Community Discord</h3>
          <p className="text-sm text-ink-body leading-relaxed mb-6">
            Join over 12,000+ automation developers. Ask questions, share custom nodes, and get real-time community help.
          </p>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5"
          >
            Join Discord Server →
          </a>
        </div>

        <div className="p-8 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-2">Email Support</h3>
          <p className="text-sm text-ink-body leading-relaxed mb-6">
            For billing inquiries, account security, and enterprise SLA escalation. Average response time under 30 minutes.
          </p>
          <a
            href="mailto:support@automatex.dev"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5"
          >
            support@automatex.dev →
          </a>
        </div>

        <div className="p-8 rounded-3xl border border-cream-border bg-white shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <Terminal className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-2">Documentation Hub</h3>
          <p className="text-sm text-ink-body leading-relaxed mb-6">
            Step-by-step guides, code examples, expression syntax, and REST API references for every node.
          </p>
          <a
            href="/docs"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5"
          >
            Open Documentation →
          </a>
        </div>
      </div>

      {/* Submit Support Ticket Form */}
      <div className="rounded-3xl border border-cream-border bg-white p-8 sm:p-12 max-w-2xl mx-auto shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-2">Submit a Support Ticket</h2>
          <p className="text-xs sm:text-sm text-ink-body">Directly routes to our on-duty reliability engineers.</p>
        </div>

        {ticketSubmitted ? (
          <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-900">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold">Ticket #{ticketId} Submitted!</h3>
            <p className="text-sm mt-2 text-emerald-800">
              We have dispatched your issue to our engineering team. An update will be sent to <strong>{formData.email}</strong> shortly.
            </p>
            <button
              onClick={() => setTicketSubmitted(false)}
              className="mt-6 px-6 py-2.5 rounded-xl font-semibold text-xs bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Your Name</label>
                <input
                  type="text"
                  placeholder="Alex Rivera"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="alex@company.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
                >
                  <option>Workflow Execution Issue</option>
                  <option>Integration / OAuth Connection</option>
                  <option>AI Orchestration & Tokens</option>
                  <option>Billing & Plan Upgrades</option>
                  <option>Custom Connector Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
                >
                  <option>Low (General question)</option>
                  <option>Medium (Non-blocking issue)</option>
                  <option>High (Production degradation)</option>
                  <option>Critical (Production outage)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Description & Execution ID</label>
              <textarea
                rows={4}
                placeholder="Include your workflow UUID, execution ID, or error message..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-4 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-orange-500 text-white hover:bg-orange-600 shadow-md transition-all flex items-center justify-center gap-2"
            >
              Submit Support Ticket <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default SupportPage;
