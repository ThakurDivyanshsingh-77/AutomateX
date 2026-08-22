import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, Clock, Phone, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const OFFICES = [
  { city: 'San Francisco', address: '548 Market St, Suite 39201', state: 'CA 94104, USA', email: 'sf@automatex.dev' },
  { city: 'London', address: '100 Bishopsgate, Level 18', state: 'London EC2N 4AG, UK', email: 'london@automatex.dev' },
  { city: 'Bengaluru', address: 'Indiranagar 100ft Rd, 4th Block', state: 'Karnataka 560038, India', email: 'india@automatex.dev' },
];

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'Sales & Enterprise Demo',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Thank you! Your message has been sent to our team.');
  };

  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Mail className="w-3.5 h-3.5" /> Get in Touch
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-6" style={{ color: '#1A1012' }}>
          Let's discuss how AutomateX can <span style={{ color: '#ff4f00' }}>accelerate your workflows</span>
        </h1>
        <p className="text-lg text-ink-body max-w-2xl mx-auto" style={{ color: '#5C5050' }}>
          Have a question about high-volume pricing, custom connectors, or security compliance? We'd love to chat.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        {/* Left Form */}
        <div className="lg:col-span-7 bg-white border border-cream-border rounded-3xl p-8 sm:p-12 shadow-xs">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-2">Send us a message</h2>
          <p className="text-xs sm:text-sm text-ink-body mb-8">We usually respond within 60 minutes during business hours.</p>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-900">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold">Message Received!</h3>
              <p className="text-sm mt-2 text-emerald-800">
                Thank you <strong>{formData.name}</strong>. A technical director will reply to <strong>{formData.email}</strong> shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 px-6 py-2.5 rounded-xl font-semibold text-xs bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Your Name</label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Work Email</label>
                  <input
                    type="email"
                    placeholder="jane@company.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Inquiry Topic</label>
                <select
                  value={formData.topic}
                  onChange={e => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft"
                >
                  <option>Sales & Enterprise Demo</option>
                  <option>Custom Connector Request</option>
                  <option>Partnership & Integration</option>
                  <option>Security & Compliance Audit</option>
                  <option>General Support Question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">Your Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your team's automation goals..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-4 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-cream-soft resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-orange-500 text-white hover:bg-orange-600 shadow-md transition-all flex items-center justify-center gap-2"
              >
                Send Message <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Right Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-3xl bg-ink text-white">
            <h3 className="text-xl font-bold mb-4">Direct Contact Points</h3>
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-orange-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-gray-400 text-2xs uppercase">General & Sales</div>
                  <div className="font-semibold text-white">contact@automatex.dev</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-orange-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-gray-400 text-2xs uppercase">Average Response Time</div>
                  <div className="font-semibold text-emerald-400">&lt; 45 minutes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Office Cards */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 px-1">Global Locations</div>
            {OFFICES.map((off, i) => (
              <div key={i} className="p-4 rounded-2xl border border-cream-border bg-white flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center text-orange-600 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-ink text-sm">{off.city}</div>
                  <div className="text-xs text-ink-body">{off.address}, {off.state}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
