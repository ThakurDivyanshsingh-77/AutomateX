import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Grid, Layers, Sparkles, Webhook, ArrowUpRight, 
  Check, ArrowRight, MessageSquare, Database, GitBranch, CreditCard, Mail
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Integrations' },
  { id: 'ai', label: 'AI & LLMs' },
  { id: 'comm', label: 'Communication' },
  { id: 'dev', label: 'Developer & DevOps' },
  { id: 'data', label: 'Databases & Storage' },
  { id: 'crm', label: 'CRM & Marketing' },
  { id: 'pay', label: 'Payments & Billing' },
];

const APPS = [
  {
    name: 'OpenAI GPT-4o',
    category: 'ai',
    description: 'Execute reasoning tasks, auto-generate structured data, summarize payloads, and build autonomous agents.',
    icon: Sparkles,
    badge: 'Popular',
    triggers: ['Prompt Response Completed', 'Fine-tuning Job State Changed'],
    actions: ['Generate Text / Chat', 'Embeddings Vectorization', 'Structured JSON Parser']
  },
  {
    name: 'Anthropic Claude 3.5',
    category: 'ai',
    description: 'Analyze complex codebases, process long-context documents, and execute nuanced conversational flows.',
    icon: Sparkles,
    badge: 'AI Native',
    triggers: ['Model Output Stream'],
    actions: ['Messages API Call', 'Multi-Modal Vision Analysis']
  },
  {
    name: 'Slack',
    category: 'comm',
    description: 'Send dynamic rich interactive block messages, trigger workflows on reactions, mentions, or slash commands.',
    icon: MessageSquare,
    badge: 'Verified',
    triggers: ['New Channel Message', 'Reaction Added', 'Slash Command Invoked'],
    actions: ['Send Message / Blocks', 'Create Channel', 'Update Status', 'Upload File']
  },
  {
    name: 'Discord',
    category: 'comm',
    description: 'Automate community moderation, webhook alerts, role assignments, and bot announcements.',
    icon: MessageSquare,
    badge: 'Verified',
    triggers: ['New Member Joined', 'Channel Message Sent'],
    actions: ['Send Embed Message', 'Assign Guild Role', 'Create Forum Thread']
  },
  {
    name: 'GitHub',
    category: 'dev',
    description: 'Trigger workflows on PRs, releases, commits, and automate issue triage or CI/CD deployment gates.',
    icon: GitBranch,
    badge: 'Core',
    triggers: ['Pull Request Opened/Merged', 'Issue Created', 'Workflow Run Completed', 'Push Event'],
    actions: ['Create Issue', 'Add PR Comment', 'Trigger Repository Dispatch', 'Merge PR']
  },
  {
    name: 'PostgreSQL & MySQL',
    category: 'data',
    description: 'Run parameterized queries, listen for WAL table changes, and synchronize tabular records instantly.',
    icon: Database,
    badge: 'High Speed',
    triggers: ['New Row Inserted (CDC)', 'Row Updated'],
    actions: ['Execute Query', 'Insert Batch Records', 'Update By ID']
  },
  {
    name: 'Stripe',
    category: 'pay',
    description: 'Listen to subscription lifecycle events, invoices, and trigger instant fulfillment or churn prevention.',
    icon: CreditCard,
    badge: 'Verified',
    triggers: ['Payment Succeeded', 'Subscription Canceled', 'Invoice Payment Failed', 'Customer Created'],
    actions: ['Create Customer', 'Issue Refund', 'Create Checkout Session']
  },
  {
    name: 'Notion',
    category: 'crm',
    description: 'Create database pages, sync task boards, update CRM properties, and automate team documentation.',
    icon: Layers,
    badge: 'Productivity',
    triggers: ['Database Item Created', 'Page Content Updated'],
    actions: ['Create Page in Database', 'Append Block Children', 'Query Database']
  },
  {
    name: 'HubSpot',
    category: 'crm',
    description: 'Enrich incoming B2B leads, log deals, update contact stages, and trigger sales nurture sequences.',
    icon: Layers,
    badge: 'Enterprise',
    triggers: ['New Contact Enrolled', 'Deal Stage Changed'],
    actions: ['Create Contact', 'Associate Deal', 'Update Lead Status']
  },
  {
    name: 'Custom Webhooks & REST',
    category: 'dev',
    description: 'Connect ANY API or internal service with HMAC secret verification, custom headers, and payload transforms.',
    icon: Webhook,
    badge: 'Universal',
    triggers: ['Incoming HTTP Webhook (POST/PUT/GET)', 'Signed HMAC Payload'],
    actions: ['Custom HTTP Request (REST/GraphQL)', 'Multipart Upload']
  },
  {
    name: 'SendGrid & Resend',
    category: 'comm',
    description: 'Deliver transactional emails with dynamic Handlebars templates and track delivery events.',
    icon: Mail,
    badge: 'Verified',
    triggers: ['Email Bounced', 'Email Opened / Clicked'],
    actions: ['Send Transactional Email', 'Add Contact to List']
  },
  {
    name: 'Redis Cache & PubSub',
    category: 'data',
    description: 'Set distributed locks, manage caching keys, rate-limit workflows, and publish real-time messages.',
    icon: Database,
    badge: 'Ultra Fast',
    triggers: ['PubSub Channel Message'],
    actions: ['Get / Set Key with TTL', 'Publish Event', 'Increment Counter']
  }
];

export function IntegrationsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeAppModal, setActiveAppModal] = useState(null);

  const filteredApps = APPS.filter(app => {
    const matchesCat = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
                          app.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <Grid className="w-3.5 h-3.5" /> 100+ Pre-built Connectors
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-6" style={{ color: '#1A1012' }}>
          Connect every tool in your <span style={{ color: '#ff4f00' }}>engineering stack</span>
        </h1>
        <p className="text-lg text-ink-body max-w-2xl mx-auto" style={{ color: '#5C5050' }}>
          Seamlessly link AI models, databases, developer tools, and communication channels in one unified canvas.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search integrations (e.g. Slack, OpenAI, Postgres)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-white transition-all shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: selectedCategory === cat.id ? '#1A1012' : '#EFECEA',
                color: selectedCategory === cat.id ? '#ffffff' : '#5C5050',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Connectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredApps.map((app, i) => {
          const Icon = app.icon;
          return (
            <div
              key={i}
              onClick={() => setActiveAppModal(app)}
              className="p-6 rounded-2xl border border-cream-border bg-white hover:border-orange-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cream group-hover:bg-orange-50 transition-colors">
                    <Icon className="w-6 h-6 text-ink group-hover:text-orange-500 transition-colors" />
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cream-soft text-ink-body">
                    {app.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-ink mb-2 group-hover:text-orange-600 transition-colors flex items-center gap-1.5">
                  {app.name}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-ink-body leading-relaxed mb-4">
                  {app.description}
                </p>
              </div>

              <div className="border-t border-cream-border pt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{app.triggers.length} Triggers</span>
                <span>•</span>
                <span>{app.actions.length} Actions</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Need a Custom Connector? */}
      <div className="rounded-2xl p-8 border border-cream-border bg-cream-soft flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
        <div>
          <h3 className="text-xl font-bold text-ink mb-1">Don't see your specific SaaS or internal tool?</h3>
          <p className="text-sm text-ink-body">
            AutomateX includes a Universal HTTP & Webhook connector that works with any REST, GraphQL, or gRPC endpoint right out of the box.
          </p>
        </div>
        <Link
          to="/docs"
          className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-ink text-white hover:bg-ink-soft shrink-0 transition-colors"
        >
          Explore Webhooks Guide
        </Link>
      </div>

      {/* Integration Detail Modal */}
      {activeAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-cream-border shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 font-bold">
                  {activeAppModal.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-ink">{activeAppModal.name}</h4>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">{activeAppModal.category}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveAppModal(null)}
                className="text-gray-400 hover:text-ink text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-ink-body mb-5">{activeAppModal.description}</p>

            <div className="space-y-4 mb-6">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-ink mb-2">Supported Triggers</h5>
                <div className="flex flex-wrap gap-1.5">
                  {activeAppModal.triggers.map((t, idx) => (
                    <span key={idx} className="text-xs bg-cream px-2.5 py-1 rounded-md text-ink-body border border-cream-border">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-ink mb-2">Available Actions</h5>
                <div className="flex flex-wrap gap-1.5">
                  {activeAppModal.actions.map((a, idx) => (
                    <span key={idx} className="text-xs bg-orange-50 px-2.5 py-1 rounded-md text-orange-700 border border-orange-100 font-medium">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-orange-500 text-white text-center hover:bg-orange-600 transition-colors"
              >
                Connect {activeAppModal.name} Free
              </Link>
              <button
                onClick={() => setActiveAppModal(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-cream-border text-ink hover:bg-cream"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IntegrationsPage;
