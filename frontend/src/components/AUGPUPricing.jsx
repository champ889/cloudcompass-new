import React, { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GPU_MODELS = ['A100', 'H100', 'H200'];
const BILLING_MODES = [
  { key: 'onDemand', label: 'On-demand' },
  { key: 'spot', label: 'Spot / Preemptible' },
  { key: 'reserved', label: 'Reserved (12mo)' },
];
const TYPE_FILTERS = ['All', 'Hyperscaler', 'AI Neocloud', 'AU Sovereign'];

const AUSovBadge = () => (
  <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: '#00843D22', color: '#00843D' }}>
    🇦🇺 AU
  </span>
);

const InputRow = ({ label, unit, value, onChange, min = 0, max, step = 1 }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold uppercase tracking-widest opacity-60">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="number" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="form-input flex-1 rounded-lg px-3 py-2 text-sm bg-transparent border"
      />
      <span className="text-xs opacity-50 w-20">{unit}</span>
    </div>
  </div>
);

const AUGPUPricing = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [gpuModel, setGpuModel] = useState('H100');
  const [billingMode, setBillingMode] = useState('onDemand');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showAUOnly, setShowAUOnly] = useState(false);

  // Calculator inputs
  const [gpuCount, setGpuCount] = useState(4);
  const [hoursPerDay, setHoursPerDay] = useState(12);
  const [daysPerMonth, setDaysPerMonth] = useState(20);
  const [egressGb, setEgressGb] = useState(100);

  useEffect(() => {
    fetch('/api/au-gpu-pricing')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch'); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const filteredProviders = useMemo(() => {
    if (!data) return [];
    return data.providers.filter(p => {
      if (showAUOnly && !p.auRegion) return false;
      if (typeFilter !== 'All' && p.type !== typeFilter) return false;
      return true;
    });
  }, [data, showAUOnly, typeFilter]);

  const costs = useMemo(() => {
    if (!data) return [];
    const hoursPerMonth = hoursPerDay * daysPerMonth;
    return filteredProviders.map(p => {
      const gpuData = p.gpus[gpuModel];
      const rate = gpuData?.[billingMode];
      if (!rate) return { ...p, available: false, total: null };
      const compute = rate * gpuCount * hoursPerMonth;
      const egress = egressGb * (p.egress || 0);
      const total = compute + egress;
      return { ...p, available: true, rate, compute: Math.round(compute), egress: Math.round(egress), total: Math.round(total) };
    }).sort((a, b) => {
      if (!a.available && !b.available) return 0;
      if (!a.available) return 1;
      if (!b.available) return -1;
      return a.total - b.total;
    });
  }, [filteredProviders, gpuModel, billingMode, gpuCount, hoursPerDay, daysPerMonth, egressGb]);

  const available = costs.filter(p => p.available);
  const cheapest = available[0]?.name;

  if (loading) return <div className="text-center py-20 opacity-60">Loading GPU pricing data...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  if (!data) return null;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const chartData = {
    labels: available.map(p => p.name),
    datasets: [{
      label: 'Compute',
      data: available.map(p => p.compute),
      backgroundColor: available.map(p => p.color),
      borderRadius: 5,
    }, {
      label: 'Egress',
      data: available.map(p => p.egress),
      backgroundColor: available.map(p => p.color + '66'),
      borderRadius: 5,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor, font: { size: 11 } } },
      tooltip: { callbacks: { label: ctx => ` $${ctx.parsed.y.toLocaleString()}/mo` } },
    },
    scales: {
      x: { stacked: true, ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } },
      y: { stacked: true, beginAtZero: true, ticks: { color: textColor, callback: v => '$' + v.toLocaleString() }, grid: { color: gridColor } },
    },
  };

  return (
    <div className="mt-16 border-t border-gray-700 pt-16">
      <div className="text-center mb-10">
        <h3 className="text-2xl font-bold mb-2">GPU Pricing for Australian Customers</h3>
        <p className="opacity-60 max-w-2xl mx-auto text-sm">
          All providers accessible from Australia — hyperscalers, global AI neoclouds, and sovereign AU providers — compared in one view.
        </p>
        <p className="text-xs opacity-30 mt-1">USD pricing. AU-region hyperscaler pricing ~10-15% higher than US. Last updated {data.lastUpdated}.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {/* GPU Model */}
        <div className="flex gap-1">
          {GPU_MODELS.map(g => (
            <button key={g} onClick={() => setGpuModel(g)} className={`service-pill text-xs ${gpuModel === g ? 'active' : ''}`}>{g}</button>
          ))}
        </div>
        <div className="w-px bg-gray-600 hidden md:block" />
        {/* Billing mode */}
        <div className="flex gap-1">
          {BILLING_MODES.map(m => (
            <button key={m.key} onClick={() => setBillingMode(m.key)} className={`service-pill text-xs ${billingMode === m.key ? 'active' : ''}`}>{m.label}</button>
          ))}
        </div>
        <div className="w-px bg-gray-600 hidden md:block" />
        {/* Type filter */}
        <div className="flex gap-1">
          {TYPE_FILTERS.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`service-pill text-xs ${typeFilter === t ? 'active' : ''}`}>{t}</button>
          ))}
        </div>
        <div className="w-px bg-gray-600 hidden md:block" />
        {/* AU only toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={showAUOnly} onChange={e => setShowAUOnly(e.target.checked)} className="w-4 h-4" />
          <span>🇦🇺 AU data centres only</span>
        </label>
      </div>

      {/* Pricing table */}
      <div className="overflow-x-auto rounded-xl shadow mb-10">
        <table className="min-w-full comparison-table text-sm">
          <thead>
            <tr>
              <th className="p-4 text-left">Provider</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">AU Region</th>
              <th className="p-4 text-right">{gpuModel} {BILLING_MODES.find(m => m.key === billingMode)?.label}</th>
              <th className="p-4 text-right">Egress/GB</th>
              <th className="p-4 text-left">Instance</th>
            </tr>
          </thead>
          <tbody>
            {filteredProviders.map(p => {
              const gpuData = p.gpus[gpuModel];
              const rate = gpuData?.[billingMode];
              const isAvailable = !!rate;
              const isCheapest = costs.find(c => c.name === p.name)?.name === cheapest && isAvailable;
              return (
                <tr key={p.name} style={{ opacity: isAvailable ? 1 : 0.45 }}>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="font-semibold" style={{ color: p.color }}>{p.name}</span>
                      {p.auRegion && <AUSovBadge />}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-0.5 rounded opacity-70" style={{ border: `1px solid ${p.color}44` }}>{p.type}</span>
                  </td>
                  <td className="p-4 text-xs opacity-60">{p.auLocation}</td>
                  <td className="p-4 text-right font-mono">
                    {isAvailable ? (
                      <div className="flex items-center justify-end gap-2">
                        {isCheapest && <span className="text-xs bg-green-500 text-white rounded-full px-2 py-0.5">Lowest</span>}
                        <span className="font-bold">${rate}/hr</span>
                      </div>
                    ) : (
                      <span className="text-xs opacity-40">{p.type === 'AU Sovereign' ? 'Contact sales' : 'N/A'}</span>
                    )}
                  </td>
                  <td className="p-4 text-right font-mono text-xs">
                    {p.egress === 0 ? <span className="text-green-400">Free</span>
                      : p.egress === null ? <span className="opacity-40">—</span>
                      : `$${p.egress}/GB`}
                  </td>
                  <td className="p-4 text-xs opacity-60 max-w-48">{gpuData?.instance || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Calculator */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="provider-card rounded-xl p-6 shadow space-y-4">
          <h4 className="font-semibold text-base mb-4">Monthly Cost Estimator</h4>
          <InputRow label="Number of GPUs" unit="GPUs" value={gpuCount} onChange={setGpuCount} min={1} max={256} />
          <InputRow label="Hours per day" unit="hrs/day" value={hoursPerDay} onChange={setHoursPerDay} min={1} max={24} />
          <InputRow label="Days per month" unit="days/mo" value={daysPerMonth} onChange={setDaysPerMonth} min={1} max={31} />
          <InputRow label="Data egress" unit="GB/mo" value={egressGb} onChange={setEgressGb} min={0} />
          <div className="pricing-note rounded-lg p-3 text-xs opacity-60">
            {gpuCount} × {gpuModel} × {hoursPerDay * daysPerMonth}hrs/mo = {gpuCount * hoursPerDay * daysPerMonth} GPU-hours/mo
          </div>
        </div>

        <div className="space-y-4">
          {available.length > 0 ? (
            <>
              <div className="provider-card rounded-xl p-4 shadow" style={{ height: 260 }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {available.slice(0, 6).map((p, i) => (
                  <div key={p.name} className="provider-card rounded-xl p-3 shadow text-center"
                    style={{ borderTopColor: p.color, borderTopWidth: 2 }}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <p className="text-xs font-bold" style={{ color: p.color }}>{p.name}</p>
                      {p.auRegion && <span className="text-xs">🇦🇺</span>}
                    </div>
                    <p className="text-xl font-bold">${p.total.toLocaleString()}</p>
                    <p className="text-xs opacity-40">/month</p>
                    {p.name === cheapest && i === 0 && (
                      <span className="inline-block mt-1 text-xs bg-green-500 text-white rounded-full px-2 py-0.5">Lowest</span>
                    )}
                    <div className="mt-2 text-xs opacity-50 text-left space-y-0.5 border-t border-gray-700 pt-1">
                      <div className="flex justify-between"><span>Compute</span><span>${p.compute.toLocaleString()}</span></div>
                      <div className="flex justify-between">
                        <span>Egress</span>
                        <span style={{ color: p.egress === 0 ? '#22c55e' : 'inherit' }}>
                          {p.egress === 0 ? 'Free' : `$${p.egress}`}
                        </span>
                      </div>
                      <div className="flex justify-between"><span>${p.rate}/GPU/hr</span><span>{p.sovereignty.includes('AU') ? '🇦🇺' : '🌐'}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="provider-card rounded-xl p-10 text-center opacity-40">
              No providers offer {gpuModel} at {BILLING_MODES.find(m => m.key === billingMode)?.label} pricing with current filters.
            </div>
          )}
        </div>
      </div>

      <p className="text-xs opacity-30 text-center mt-6">{data.disclaimer}</p>
    </div>
  );
};

export default AUGPUPricing;
