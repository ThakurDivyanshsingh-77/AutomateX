import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateService } from '../services/templateService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Loader } from '../../../components/ui/Loader';
import toast from 'react-hot-toast';
import { Sparkles, GitFork, ArrowRight, Layers, Cpu, Mail, CheckCircle2 } from 'lucide-react';

export const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchTemplates();
  }, [category]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await templateService.getTemplates(category);
      setTemplates(res.data || []);
    } catch (err) {
      toast.error('Failed to load marketplace templates');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (id) => {
    try {
      const res = await templateService.instantiateTemplate(id);
      const newWf = res.workflow || res.data || res;
      toast.success(res.message || 'Template cloned into your workflows!');
      navigate(`/builder/${newWf._id}`);
    } catch (err) {
      toast.error('Failed to clone template');
    }
  };

  const categories = [
    { label: 'All Categories', value: 'all' },
    { label: 'Development', value: 'Development' },
    { label: 'Communication', value: 'Communication' },
    { label: 'AI & Automation', value: 'AI' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none font-sans text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-amber-500/10 blur-[70px] rounded-full pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Workflow Templates Marketplace
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Instantly clone battle-tested pre-built automation graphs for Google Sheets, Gmail, Discord, Slack, and AI.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 w-fit">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              category === cat.value
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-glow-brand font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {loading ? (
        <Loader text="Loading templates marketplace..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <Card
              key={tpl._id}
              className="flex flex-col justify-between space-y-4 glass-card border border-slate-800/80 hover:border-brand-500/40 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 uppercase">
                    {tpl.category}
                  </span>
                  {tpl.isFeatured && (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Sparkles className="w-3 h-3 fill-amber-400" /> Featured
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">
                  {tpl.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {tpl.description}
                </p>
              </div>

              <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {tpl.definition?.nodes?.length || 0} Nodes
                </span>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUseTemplate(tpl._id)}
                  className="shadow-glow-brand"
                >
                  Use Template <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

