import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PROVIDERS = {
  CoreWeave: { label: 'CoreWeave', color: '#76b900' },
  Lambda:    { label: 'Lambda Labs', color: '#e85d2a' },
  RunPod:    { label: 'RunPod', color: '#7c5cbf' },
  Nebius:    { label: 'Nebius', color: '#0077cc' },
};

// May 2026 verified pricing (per GPU/hour)
const GPU_PRICING = {
  A100: {
    CoreWeave: { onDemand: 2.70, spot: null,  reserved: 1.08 },
    Lambda:    { onDemand: 1.29, spot: null,  reserved: 0.68 },
    RunPod:    { onDemand: 1.99, spot: 0.80,  reserved: null },
    Nebius:    { onDemand: 1.60, spot: null,  reserved: 1.10 },
  },
  H100: {
    CoreWeave: { onDemand: 6.16, spot: 2.50,  reserved: 2.46 },
    Lambda:    { onDemand: 2.99, spot: null,  reserved: 1.57 },
    RunPod:    { onDemand: 2.49, spot: 1.49,  reserved: null },
    Nebius:    { onDemand: 2.10, spot: null,  reserved: 1.47 },
  },
  H200: {
    CoreWeave: { onDemand: 6.31, spot: null,  reserved: null },
    Lambda:    { onDemand: 4.50, spot: null,  reserved: null },
    RunPod:    { onDemand: null, spot: null,  reserved: null },
    Nebius:    { onDemand: 3.50, spot: null,  reserved: null },
  },
};

const EGRESS_RATES = {
  CoreWeave: 0,
  Lambda:    0,
  RunPod:    0.10,
  Nebius:    0.08,
};

const STORAGE_RATES = {
  CoreWeave: 0.10,
  Lambda:    0.20,
  RunPod:    0.07,
  Nebius:    0.08,
};

const HOURS_PER_MONTH = 730;

const GPU_MODELS = ['A100', 'H100', 'H200'];
const BILLING_MODES = ['onDemand', 'spot', 'reserved'];
const BILLING_LABELS = { onDemand: 'On-demand', spot: 'Spot', reserved: 'Reserved (12mo)' };

const InputRow = ({ label, unit, value, onChange, min = 0, max, step = 1 }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold uppercase tracking-widest opacity-60">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="form-input flex-1 rounded-lg px-3 py-2 text-sm bg-transparent border"
      />
      <span className="text-xs opacity-50 w-24">{unit}</span>
    </div>
  </div>
);

const AICloudCalculator = () => {
  const [gpuModel, setGpuModel] = useState('H100');
  const [billingMode, setBillingMode] = useState('onDemand');
  const [gpuCount, setGpuCount] = useState(4);
  const [hoursPerDay, setHoursPerDay] = useState(12);
  const [daysPerMonth, setDaysPerMonth] = useState(20);
  const [egressGb, setEgressGb] = useState(100);
  const [storageGb, setStorageGb] = useState(500);

  const costs = useMemo(() => {
    const hoursPerMonth = hoursPerDay * daysPerMonth;
    return Object.fromEntries(
      Object.keys(PROVIDERS).map(p => {
        const rate = GPU_PRICING[gpuModel][p][billingMode];
        if (rate === null) return [p, null];

        const compute = rate * gpuCount * hoursPerMonth;
        const egress = egressGb * EGRESS_RATES[p];
        const storage = storageGb * STORAGE_RATES[p];
        const total = compute + egress + storage;

        return [p, {
          compute: Math.round(compute),
          egress: Math.round(egress),
          storage: Math.round(storage),
          total: Math.round(total),
          ratePerHour: rate,
        }];
      })
    );
  }, [gpuModel, billingMode, gpuCount, hoursPerDay, daysPerMonth, egressGb, storageGb]);

  const available = Object.entries(costs).filter(([, v]) => v !== null);
  const cheapest = available.length > 0
    ? available.sort((a, b) => a[1].total - b[1].total)[0][0]
    : null;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const chartLabels = available.map(([p]) => PROVIDERS[p].label);
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Compute',
        data: available.map(([p]) => costs[p].compute),
        backgroundColor: available.map(([p]) => PROVIDERS[p].color + 'CC'),
        borderRadius: 6,
      },
      {
        label: 'Egress',
        data: available.map(([p]) => costs[p].egress),
        backgroundColor: available.map(([p]) => PROVIDERS[p].color + '66'),
        borderRadius: 6,
      },
      {
        label: 'Storage',
        data: available.map(([p]) => costs[p].storage),
        backgroundColor: available.map(([p]) => PROVIDERS[p].color + '33'),
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor, font: { size: 11 } } },
      tooltip: { callbacks: { label: ctx => ` $${ctx.parsed.y.toLocaleString()}/mo` } },
    },
    scales: {
      x: { stacked: true, ticks: { color: textColor }, grid: { color: gridColor } },
      y: { stacked: true, beginAtZero: true, ticks: { color: textColor, callback: v => '$' + v.toLocaleString() }, grid: { color: gridColor } },
    },
  };

  return (
    <section id="aicloud-calculator" className="py-12 border-t border-gray-700">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold mb-2">AI Cloud Cost Calculator</h3>
        <p className="text-sm opacity-60">Estimate your monthly GPU spend across CoreWeave, Lambda, RunPod, and Nebius.</p>
        <p className="text-xs opacity-30 mt-1">Based on May 2026 public pricing. Verify before provisioning.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="provider-card rounded-xl p-6 shadow space-y-6">

          {/* GPU Model */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-2">GPU Model</p>
            <div className="flex gap-2 flex-wrap">
              {GPU_MODELS.map(g => (
                <button
                  key={g}
                  onClick={() => setGpuModel(g)}
                  className={`service-pill text-sm ${gpuModel === g ? 'active' : ''}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Billing Mode */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-2">Billing Mode</p>
            <div className="flex gap-2 flex-wrap">
              {BILLING_MODES.map(m => (
                <button
                  key={m}
                  onClick={() => setBillingMode(m)}
                  className={`service-pill text-sm ${billingMode === m ? 'active' : ''}`}
                >
                  {BILLING_LABELS[m]}
                </button>
              ))}
            </div>
            {billingMode === 'spot' && (
              <p className="text-xs text-yellow-400 mt-2">⚠ Spot instances can be interrupted. Not all providers offer spot pricing.</p>
            )}
            {billingMode === 'reserved' && (
              <p className="text-xs text-blue-400 mt-2">Reserved pricing assumes ~12-month commitment. Not available on all providers.</p>
            )}
          </div>

          <InputRow label="Number of GPUs" unit="GPUs" value={gpuCount} onChange={setGpuCount} min={1} max={256} />
          <InputRow label="Hours per day" unit="hrs/day" value={hoursPerDay} onChange={setHoursPerDay} min={1} max={24} />
          <InputRow label="Days per month" unit="days/mo" value={daysPerMonth} onChange={setDaysPerMonth} min={1} max={31} />
          <InputRow label="Data egress" unit="GB/mo" value={egressGb} onChange={setEgressGb} min={0} />
          <InputRow label="Storage" unit="GB/mo" value={storageGb} onChange={setStorageGb} min={0} />

          <div className="pricing-note rounded-lg p-3 text-xs opacity-60">
            Total hours: {hoursPerDay * daysPerMonth}hrs/mo across {gpuCount} GPU{gpuCount > 1 ? 's' : ''}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-5">
          {/* Chart */}
          <div className="provider-card rounded-xl p-5 shadow" style={{ height: 280 }}>
            {available.length > 0
              ? <Bar data={chartData} options={chartOptions} />
              : <div className="flex items-center justify-center h-full text-sm opacity-40">No providers offer {gpuModel} at {BILLING_LABELS[billingMode]} pricing</div>
            }
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(costs).map(([p, c]) => (
              <div key={p} className="provider-card rounded-xl p-4 shadow text-center"
                style={{ borderTopColor: PROVIDERS[p].color, borderTopWidth: 2, opacity: c === null ? 0.4 : 1 }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: PROVIDERS[p].color }}>
                  {PROVIDERS[p].label}
                </p>
                {c === null ? (
                  <p className="text-xs opacity-50">Not available</p>
                ) : (
                  <>
                    <p className="text-2xl font-bold">${c.total.toLocaleString()}</p>
                    <p className="text-xs opacity-50">/month</p>
                    {p === cheapest && <span className="inline-block mt-1 text-xs bg-green-500 text-white rounded-full px-2 py-0.5">Lowest</span>}
                    <div className="mt-3 text-xs opacity-60 space-y-1 text-left border-t border-gray-700 pt-2">
                      <div className="flex justify-between"><span>Compute</span><span>${c.compute.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Egress</span><span style={{ color: EGRESS_RATES[p] === 0 ? '#22c55e' : 'inherit' }}>{EGRESS_RATES[p] === 0 ? 'Free' : `$${c.egress}`}</span></div>
                      <div className="flex justify-between"><span>Storage</span><span>${c.storage}</span></div>
                      <div className="flex justify-between opacity-50"><span>Rate/GPU/hr</span><span>${c.ratePerHour}</span></div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AICloudCalculator;
