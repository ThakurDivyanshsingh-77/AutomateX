import React, { useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, CheckCircle2, ChevronDown, Clock3, Download,
  Eye, FileKey2, Filter, GitFork, KeyRound, LockKeyhole, Search, ShieldCheck,
  UserRound, X,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

const EVENTS = [
  { id: 'evt_9x31', action: 'Workflow published', detail: 'Lead qualification pipeline was published', category: 'Workflow', status: 'success', actor: 'You', target: 'Lead qualification', ip: '103.85.21.44', time: 'Today, 10:42 AM', icon: GitFork },
  { id: 'evt_9x30', action: 'Credential accessed', detail: 'Gmail OAuth credential used during execution', category: 'Security', status: 'success', actor: 'Workflow runtime', target: 'Gmail OAuth', ip: 'Internal service', time: 'Today, 10:37 AM', icon: KeyRound },
  { id: 'evt_9x29', action: 'Workflow executed', detail: 'Discord automation completed successfully', category: 'Execution', status: 'success', actor: 'DAG Runtime', target: 'Discord auto responder', ip: 'Internal service', time: 'Today, 10:36 AM', icon: Activity },
  { id: 'evt_9x28', action: 'Sign-in completed', detail: 'Account authenticated with email and password', category: 'Authentication', status: 'success', actor: 'You', target: 'Web dashboard', ip: '103.85.21.44', time: 'Today, 9:18 AM', icon: UserRound },
  { id: 'evt_9x27', action: 'Credential test failed', detail: 'Discord bot token validation was rejected', category: 'Security', status: 'warning', actor: 'You', target: 'Discord Bot', ip: '103.85.21.44', time: 'Yesterday, 6:24 PM', icon: AlertTriangle },
  { id: 'evt_9x26', action: 'Workflow updated', detail: 'Three nodes and two connections were changed', category: 'Workflow', status: 'success', actor: 'You', target: 'Daily sales summary', ip: '103.85.21.44', time: 'Yesterday, 5:52 PM', icon: GitFork },
  { id: 'evt_9x25', action: 'API access denied', detail: 'Request blocked because the token had expired', category: 'Security', status: 'blocked', actor: 'API client', target: '/api/workflows', ip: '45.112.8.19', time: 'Sep 14, 2:08 PM', icon: LockKeyhole },
];

const FILTERS = ['All activity', 'Workflow', 'Execution', 'Security', 'Authentication'];

export function AuditLogs() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All activity');
  const [status, setStatus] = useState('All statuses');
  const [selected, setSelected] = useState(null);

  const events = useMemo(() => EVENTS.map(event => ({ ...event, actor: event.actor === 'You' ? (user?.name || 'You') : event.actor })), [user]);
  const filtered = useMemo(() => events.filter(event => {
    const haystack = `${event.action} ${event.detail} ${event.actor} ${event.target} ${event.id}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (category === 'All activity' || event.category === category) && (status === 'All statuses' || event.status === status);
  }), [events, query, category, status]);

  const exportCsv = () => {
    const cells = value => `"${String(value).replaceAll('"', '""')}"`;
    const rows = [['Event ID', 'Time', 'Actor', 'Action', 'Category', 'Target', 'Status', 'IP address'], ...filtered.map(e => [e.id, e.time, e.actor, e.action, e.category, e.target, e.status, e.ip])];
    const blob = new Blob([rows.map(row => row.map(cells).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'automatex-audit-log.csv'; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-orange-600"><ShieldCheck className="h-4 w-4" /> Enterprise security</div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Audit logs</h1>
          <p className="mt-1 text-sm text-slate-500">Review security-sensitive actions and account activity across your workspace.</p>
        </div>
        <button onClick={exportCsv} className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Events recorded', value: events.length, note: 'Last 30 days', icon: Activity, tone: 'text-blue-600 bg-blue-50 border-blue-100' },
          { label: 'Security events', value: events.filter(e => e.category === 'Security').length, note: 'Credentials & access', icon: FileKey2, tone: 'text-violet-600 bg-violet-50 border-violet-100' },
          { label: 'Successful actions', value: events.filter(e => e.status === 'success').length, note: 'Verified activity', icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { label: 'Needs attention', value: events.filter(e => e.status !== 'success').length, note: 'Warning or blocked', icon: AlertTriangle, tone: 'text-amber-600 bg-amber-50 border-amber-100' },
        ].map(({ label, value, note, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-950">{value}</p></div><div className={`rounded-xl border p-2 ${tone}`}><Icon className="h-4 w-4" /></div></div>
            <p className="mt-3 text-[10px] text-slate-400">{note}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div><h2 className="text-sm font-bold text-slate-900">Workspace activity</h2><p className="text-xs text-slate-500">Immutable event history for administrative review.</p></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative min-w-0 sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search events, actors or IDs" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100" /></label>
              <div className="relative"><Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><select value={category} onChange={e => setCategory(e.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-8 text-xs font-semibold text-slate-700 outline-none"><>{FILTERS.map(item => <option key={item}>{item}</option>)}</></select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /></div>
              <div className="relative"><select value={status} onChange={e => setStatus(e.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none"><option>All statuses</option><option value="success">Success</option><option value="warning">Warning</option><option value="blocked">Blocked</option></select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /></div>
            </div>
          </div>
        </div>

        <div className="hidden grid-cols-[minmax(260px,1.5fr)_minmax(140px,.7fr)_minmax(150px,.8fr)_100px_44px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 md:grid"><span>Event</span><span>Actor</span><span>Time</span><span>Status</span><span /></div>
        <div className="divide-y divide-slate-100">
          {filtered.map(event => {
            const Icon = event.icon;
            return <button key={event.id} onClick={() => setSelected(event)} className="grid w-full gap-3 px-4 py-4 text-left transition hover:bg-orange-50/40 md:grid-cols-[minmax(260px,1.5fr)_minmax(140px,.7fr)_minmax(150px,.8fr)_100px_44px] md:items-center md:gap-4 md:px-5">
              <div className="flex min-w-0 items-start gap-3"><div className="mt-0.5 shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600"><Icon className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate text-xs font-bold text-slate-900">{event.action}</p><p className="mt-0.5 truncate text-[11px] text-slate-500">{event.detail}</p><span className="mt-1 inline-block font-mono text-[9px] text-slate-400">{event.id}</span></div></div>
              <div><p className="text-xs font-semibold text-slate-700">{event.actor}</p><p className="text-[10px] text-slate-400">{event.category}</p></div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><Clock3 className="h-3.5 w-3.5" />{event.time}</div>
              <span className={`w-fit rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${event.status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : event.status === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>{event.status}</span>
              <span className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-orange-600 md:flex"><Eye className="h-4 w-4" /></span>
            </button>;
          })}
          {!filtered.length && <div className="px-5 py-16 text-center"><Search className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-700">No matching events</p><p className="text-xs text-slate-400">Try changing your search or filters.</p></div>}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-[10px] text-slate-500"><span>Showing {filtered.length} of {events.length} events</span><span>90-day retention</span></div>
      </section>

      {selected && <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/25 backdrop-blur-sm" onMouseDown={() => setSelected(null)}><aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl" onMouseDown={e => e.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">Event details</p><h2 className="mt-1 text-xl font-bold text-slate-950">{selected.action}</h2></div><button onClick={() => setSelected(null)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><X className="h-4 w-4" /></button></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">{selected.detail}</div><dl className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 px-4">{[['Event ID', selected.id], ['Actor', selected.actor], ['Category', selected.category], ['Resource', selected.target], ['Timestamp', selected.time], ['IP / source', selected.ip], ['Status', selected.status]].map(([key, value]) => <div key={key} className="flex justify-between gap-6 py-3"><dt className="text-xs text-slate-400">{key}</dt><dd className="text-right text-xs font-semibold text-slate-800">{value}</dd></div>)}</dl><div className="mt-6 flex gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" /><div><p className="text-xs font-bold text-emerald-900">Integrity verified</p><p className="mt-0.5 text-[11px] leading-relaxed text-emerald-700">This event is read-only and retained as part of your workspace audit trail.</p></div></div></aside></div>}
    </div>
  );
}

export default AuditLogs;
