import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, ArrowRight, Sparkles, Tag, User } from 'lucide-react';
import toast from 'react-hot-toast';

const POSTS = [
  {
    title: 'How We Scaled the AutomateX Engine to 50,000 Webhook Ingestions / Sec',
    category: 'Engineering',
    date: 'August 18, 2026',
    readTime: '7 min read',
    author: 'Divyansh Singh',
    authorRole: 'Core Systems Architect',
    snippet: 'A deep dive into our distributed Node.js runtime, BullMQ queue sharding, memory isolation, and how we minimized event dispatch jitter down to sub-5 milliseconds.',
  },
  {
    title: 'Deterministic AI Workflows: Why We Built Autonomous Schema Auto-Repair',
    category: 'AI & Research',
    date: 'August 04, 2026',
    readTime: '6 min read',
    author: 'Elena Rostova',
    authorRole: 'AI Research Lead',
    snippet: 'LLMs can hallucinate malformed JSON or ignore output constraints. Here is how AutomateX uses AST parsing and micro-retry prompt loops to guarantee 100% type safety.',
  },
  {
    title: 'The Death of Fragile Cron Jobs: Transitioning to Reactive Pipelines',
    category: 'Architecture',
    date: 'July 22, 2026',
    readTime: '5 min read',
    author: 'Marcus Vance',
    authorRole: 'DevOps Lead',
    snippet: 'Why traditional batch polling fails under scale and how event-driven webhooks coupled with dead letter queues solve the silent data loss problem.',
  },
  {
    title: 'Zero-Knowledge OAuth Vault: Securing 1,000,000+ Third-Party API Keys',
    category: 'Security',
    date: 'July 10, 2026',
    readTime: '8 min read',
    author: 'Sophia Chen',
    authorRole: 'Security Director',
    snippet: 'How we implemented envelope encryption with AES-256 GCM, rotating KMS hardware keys, and automated token refresh cycles with zero plaintext leakage.',
  }
];

export function BlogPage() {
  const [selectedCat, setSelectedCat] = useState('All');
  const [email, setEmail] = useState('');

  const filteredPosts = selectedCat === 'All'
    ? POSTS
    : POSTS.filter(p => p.category.includes(selectedCat));

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thank you for subscribing to AutomateX Engineering Insights!');
    setEmail('');
  };

  return (
    <div className="py-16 md:py-24 px-5 sm:px-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{ background: '#fff2ec', color: '#ff4f00', borderColor: '#ffd8c7' }}>
          <BookOpen className="w-3.5 h-3.5" /> Engineering & Product Blog
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-6" style={{ color: '#1A1012' }}>
          Insights on distributed systems, <span style={{ color: '#ff4f00' }}>AI & reliability</span>
        </h1>
        <p className="text-lg text-ink-body max-w-2xl mx-auto" style={{ color: '#5C5050' }}>
          Deep-dives from the engineers building the world's most resilient workflow automation engine.
        </p>
      </div>

      {/* Categories */}
      <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
        {['All', 'Engineering', 'AI & Research', 'Architecture', 'Security'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedCat === cat
                ? 'bg-ink text-white shadow-xs'
                : 'bg-cream-soft text-ink-body hover:text-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        {filteredPosts.map((post, idx) => (
          <article
            key={idx}
            className="p-8 rounded-3xl border border-cream-border bg-white hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span className="font-semibold px-2.5 py-1 rounded-md bg-cream text-orange-600 font-mono">
                  {post.category}
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-ink mb-3 hover:text-orange-600 transition-colors cursor-pointer">
                {post.title}
              </h2>
              <p className="text-sm text-ink-body leading-relaxed mb-6">
                {post.snippet}
              </p>
            </div>

            <div className="border-t border-cream-border pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-ink">{post.author}</div>
                  <div className="text-2xs text-gray-500">{post.authorRole}</div>
                </div>
              </div>

              <span className="text-xs font-bold text-orange-600 flex items-center gap-1 hover:gap-1.5 transition-all cursor-pointer">
                Read Article <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Newsletter */}
      <div className="rounded-3xl p-8 sm:p-12 text-center bg-cream-soft border border-cream-border max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-ink mb-2">Subscribe to AutomateX Tech Dispatch</h3>
        <p className="text-xs sm:text-sm text-ink-body mb-6">
          Get weekly architectural deep-dives, distributed systems articles, and open-source updates in your inbox.
        </p>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="engineer@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-sm outline-none focus:border-orange-500 bg-white"
            required
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm bg-orange-500 text-white hover:bg-orange-600 transition-colors shrink-0"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}

export default BlogPage;
