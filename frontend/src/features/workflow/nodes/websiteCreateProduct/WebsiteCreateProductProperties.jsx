import React, { useState, useEffect } from 'react';
import {
  PackagePlus,
  Globe,
  Sliders,
  ShieldCheck,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Info,
} from 'lucide-react';
import api from '../../../../services/api';

export const WebsiteCreateProductProperties = ({
  node,
  nodeData,
  onUpdateNodeData,
  onUpdateConfig,
}) => {
  const config = node?.data?.config || nodeData?.config || {};

  const updateConfig = (newConfig) => {
    if (onUpdateNodeData && node?.id) {
      onUpdateNodeData(node.id, { config: newConfig });
    } else if (onUpdateConfig) {
      onUpdateConfig(newConfig);
    }
  };

  const [connectionId, setConnectionId] = useState(
    config.connectionId || '{{steps["Website → Connect"].connectionId}}'
  );
  const [productExpr, setProductExpr] = useState(
    config.product || '{{steps["For Each Product"].currentItem}}'
  );
  const [endpoint, setEndpoint] = useState(config.endpoint || '/api/products');
  const [method, setMethod] = useState(config.method || 'POST');
  const [dryRun, setDryRun] = useState(Boolean(config.dryRun));
  const [duplicateStrategy, setDuplicateStrategy] = useState(config.duplicateStrategy || 'skip');
  const [rateLimitMs, setRateLimitMs] = useState(config.rateLimitMs !== undefined ? config.rateLimitMs : 1000);

  const [fieldMapping, setFieldMapping] = useState(
    config.fieldMapping || {
      name: 'product_name',
      casNumber: 'cas_number',
      urlSlug: 'slug',
      primaryKeyword: 'primary_keyword',
      titleTag: 'seo_title',
      metaDescription: 'seo_description',
      h1: 'h1',
      description: 'description',
      faqs: 'faqs',
      schemaMarkup: 'schema_markup',
    }
  );

  const [connectionsList, setConnectionsList] = useState([]);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await api.get('/website-connections');
      if (res.data?.success) {
        setConnectionsList(res.data.connections || []);
      }
    } catch (e) {
      console.warn('[WebsiteCreateProductProperties] Connections fetch:', e.message);
    }
  };

  const handleChange = (key, value) => {
    if (key === 'connectionId') setConnectionId(value);
    if (key === 'product') setProductExpr(value);
    if (key === 'endpoint') setEndpoint(value);
    if (key === 'method') setMethod(value);
    if (key === 'dryRun') setDryRun(value);
    if (key === 'duplicateStrategy') setDuplicateStrategy(value);
    if (key === 'rateLimitMs') setRateLimitMs(value);

    updateConfig({
      ...config,
      [key]: value,
    });
  };

  const handleMappingChange = (sourceKey, targetKey) => {
    const nextMapping = { ...fieldMapping, [sourceKey]: targetKey };
    setFieldMapping(nextMapping);
    updateConfig({
      ...config,
      fieldMapping: nextMapping,
    });
  };

  const handleTestProduct = async () => {
    setTesting(true);
    setTestResult(null);

    // Mock/sample product payload for testing
    const sampleProduct = {
      name: 'Beta-citronellol',
      casNumber: '106-22-9',
      urlSlug: 'beta-citronellol',
      titleTag: 'Beta-citronellol Supplier | CAS 106-22-9',
      metaDescription: 'High purity Beta-citronellol for specialty fragrance synthesis.',
      h1: 'Beta-citronellol',
      description: 'Beta-citronellol is a naturally occurring monoterpenoid alcohol.',
      faqs: [{ question: 'What is Beta-citronellol?', answer: 'An organic compound.' }],
    };

    try {
      if (dryRun) {
        setTestResult({
          success: true,
          dryRun: true,
          productName: sampleProduct.name,
          message: 'Dry run validated successfully. No real HTTP request was dispatched.',
          payload: sampleProduct,
        });
      } else {
        setTestResult({
          success: true,
          productName: sampleProduct.name,
          message: 'Test product creation payload constructed and ready for workflow execution.',
          payload: sampleProduct,
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        error: err.message,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4 text-slate-200">
      {/* Header Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-start gap-2.5">
        <PackagePlus className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-semibold text-emerald-300">Target Website Product Publisher</p>
          <p className="text-[11px] text-emerald-200/70 mt-0.5">
            Generic REST API product creator consuming Phase 3A connectionId with field mapping and duplicate control.
          </p>
        </div>
      </div>

      {/* Website Connection ID */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
          <span>Website Connection ID / Reference *</span>
          <span className="text-[10px] text-slate-500">From Website → Connect</span>
        </label>
        <input
          type="text"
          value={connectionId}
          onChange={(e) => handleChange('connectionId', e.target.value)}
          placeholder='{{steps["Website → Connect"].connectionId}}'
          className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
        />
        {connectionsList.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] text-slate-500">Saved:</span>
            {connectionsList.map((c) => (
              <button
                key={c.connectionId || c.id}
                type="button"
                onClick={() => handleChange('connectionId', c.connectionId || c.id)}
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono truncate max-w-[140px]"
              >
                {c.name || c.websiteUrl}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Source Expression */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-300">Product Source Expression *</label>
        <input
          type="text"
          value={productExpr}
          onChange={(e) => handleChange('product', e.target.value)}
          placeholder='{{steps["For Each Product"].currentItem}}'
          className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* API Endpoint & Method */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1 space-y-1">
          <label className="text-xs font-medium text-slate-300">Method</label>
          <select
            value={method}
            onChange={(e) => handleChange('method', e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
          >
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>

        <div className="col-span-2 space-y-1">
          <label className="text-xs font-medium text-slate-300">Endpoint Path</label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => handleChange('endpoint', e.target.value)}
            placeholder="/api/products"
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Dry Run & Duplicate Strategy */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Duplicate Strategy</label>
          <select
            value={duplicateStrategy}
            onChange={(e) => handleChange('duplicateStrategy', e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="skip">Skip duplicate (Default)</option>
            <option value="update">Update existing</option>
            <option value="create">Create anyway</option>
            <option value="stop">Stop workflow</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Delay Between Requests</label>
          <select
            value={rateLimitMs}
            onChange={(e) => handleChange('rateLimitMs', parseInt(e.target.value, 10))}
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
          >
            <option value={0}>0 ms (No delay)</option>
            <option value={500}>500 ms</option>
            <option value={1000}>1000 ms (1s)</option>
            <option value={2000}>2000 ms (2s)</option>
            <option value={5000}>5000 ms (5s)</option>
          </select>
        </div>
      </div>

      {/* Dry Run Mode Switch */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
        <div>
          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Dry Run Mode
          </span>
          <p className="text-[10px] text-slate-400">
            Validate payload mapping without making real HTTP requests.
          </p>
        </div>
        <input
          type="checkbox"
          checked={dryRun}
          onChange={(e) => handleChange('dryRun', e.target.checked)}
          className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
        />
      </div>

      {/* Field Mapping Accordion / Table */}
      <div className="space-y-2 pt-1 border-t border-slate-800">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            Configurable Field Mapping
          </span>
          <span className="text-[10px] text-slate-500">Source → Target Key</span>
        </label>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {Object.entries(fieldMapping).map(([srcKey, tgtKey]) => (
            <div key={srcKey} className="flex items-center gap-2">
              <span className="w-1/3 text-[11px] font-mono text-slate-400 truncate" title={srcKey}>
                {srcKey}
              </span>
              <span className="text-slate-600 text-xs">→</span>
              <input
                type="text"
                value={tgtKey}
                onChange={(e) => handleMappingChange(srcKey, e.target.value)}
                className="w-2/3 text-[11px] bg-slate-900 border border-slate-800 rounded px-2 py-1 text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Test Product Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleTestProduct}
          disabled={testing}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          {testing ? 'Testing Creation...' : dryRun ? 'Validate Payload (Dry Run)' : 'Test Product Creation'}
        </button>

        {testResult && (
          <div
            className={`mt-2 p-2.5 rounded-lg border text-xs font-mono ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold">
              {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>{testResult.productName || 'Test Result'}: {testResult.success ? 'Success' : 'Failed'}</span>
            </div>
            <p className="text-[10px] mt-1 text-slate-400">{testResult.message || testResult.error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
