import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PROVIDERS = {
  AWS:   { label: 'AWS',          color: '#FF9900' },
  Azure: { label: 'Azure',        color: '#0078D4' },
  GCP:   { label: 'Google Cloud', color: '#4285F4' },
};

// Pricing rates (per month approximations)
const RATES = {
  // Networking
  natGatewayHours:    { AWS: 0.059,  Azure: 0.045,  GCP: 0.044  }, // $/hr
  natDataPerGb:       { AWS: 0.059,  Azure: 0.045,  GCP: 0.045  }, // $/GB
  lbHours:            { AWS: 0.008,  Azure: 0.008,  GCP: 0.008  }, // $/hr
  cdnPerGb:           { AWS: 0.085,  Azure: 0.087,  GCP: 0.080  }, // $/GB first 10TB
  vpnHours:           { AWS: 0.05,   Azure: 0.04,   GCP: 0.05   }, // $/hr
  egressPerGb:        { AWS: 0.09,   Azure: 0.087,  GCP: 0.08   }, // $/GB egress
  dnsZone:            { AWS: 0.50,   Azure: 0.50,   GCP: 0.20   }, // $/zone/mo
  // Kubernetes
  k8sControlPlane:    { AWS: 73,     Azure: 0,      GCP: 73     }, // $/mo per cluster
  k8sNodeMediumHour:  { AWS: 0.096,  Azure: 0.096,  GCP: 0.095  }, // $/hr per node
};

const HOURS_PER_MONTH = 730;

const InputRow = ({ label, unit, value, onChange, min = 0 }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold uppercase tracking-widest opacity-60">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={min}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="form-input flex-1 rounded-lg px-3 py-2 text-sm bg-transparent border"
      />
      <span className="text-xs opacity-50 w-20">{unit}</span>
    </div>
  </div>
);

const CostCalculator = () => {
  // Networking inputs
  const [natHours, setNatHours] = useState(HOURS_PER_MONTH);
  const [natDataGb, setNatDataGb] = useState(500);
  const [lbHours, setLbHours] = useState(HOURS_PER_MONTH);
  const [cdnGb, setCdnGb] = useState(1000);
  const [vpnEnabled, setVpnEnabled] = useState(false);
  const [egressGb, setEgressGb] = useState(200);
  const [dnsZones, setDnsZones] = useState(3);

  // Kubernetes inputs
  const [k8sEnabled, setK8sEnabled] = useState(false);
  const [k8sClusters, setK8sClusters] = useState(1);
  const [k8sNodes, setK8sNodes] = useState(3);

  const costs = useMemo(() => {
    return Object.fromEntries(Object.keys(PROVIDERS).map(p => {
      let net = 0;
      net += natHours * RATES.natGatewayHours[p];
      net += natDataGb * RATES.natDataPerGb[p];
      net += lbHours * RATES.lbHours[p];
      net += cdnGb * RATES.cdnPerGb[p];
      if (vpnEnabled) net += HOURS_PER_MONTH * RATES.vpnHours[p];
      net += egressGb * RATES.egressPerGb[p];
      net += dnsZones * RATES.dnsZone[p];

      let k8s = 0;
      if (k8sEnabled) {
        k8s += k8sClusters * RATES.k8sControlPlane[p];
        k8s += k8sNodes * HOURS_PER_MONTH * RATES.k8sNodeMediumHour[p];
      }

      return [p, { net: Math.round(net), k8s: Math.round(k8s), total: Math.round(net + k8s) }];
    }));
  }, [natHours, natDataGb, lbHours, cdnGb, vpnEnabled, egressGb, dnsZones, k8sEnabled, k8sClusters, k8sNodes]);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#F9FAFB' : '#1F2937';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const chartData = {
    labels: Object.values(PROVIDERS).map(p => p.label),
    datasets: [
      {
        label: 'Networking',
        data: Object.keys(PROVIDERS).map(p => costs[p].net),
        backgroundColor: Object.values(PROVIDERS).map(p => p.color + 'CC'),
        borderRadius: 6,
      },
      ...(k8sEnabled ? [{
        label: 'Kubernetes',
        data: Object.keys(PROVIDERS).map(p => costs[p].k8s),
        backgroundColor: Object.values(PROVIDERS).map(p => p.color + '55'),
        borderRadius: 6,
      }] : []),
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor } },
      tooltip: { callbacks: { label: ctx => ` $${ctx.parsed.y.toLocaleString()}/mo` } },
    },
    scales: {
      x: { stacked: true, ticks: { color: textColor }, grid: { color: gridColor } },
      y: { stacked: true, beginAtZero: true, ticks: { color: textColor, callback: v => '$' + v.toLocaleString() }, grid: { color: gridColor } },
    },
  };

  const cheapest = Object.entries(costs).sort((a, b) => a[1].total - b[1].total)[0][0];

  return (
    <section id="calculator" className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">Cost Calculator</h2>
        <p className="opacity-60 max-w-2xl mx-auto">Estimate your monthly cloud spend across networking and Kubernetes for AWS, Azure, and GCP.</p>
        <p className="text-xs opacity-40 mt-2">Estimates only — based on public pricing. Actual costs vary by region, usage, and discounts.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-8">
          {/* Networking */}
          <div className="provider-card rounded-xl p-6 shadow">
            <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
              <span className="text-blue-400">🌐</span> Networking
            </h3>
            <div className="space-y-4">
              <InputRow label="NAT Gateway hours" unit="hrs/mo" value={natHours} onChange={setNatHours} />
              <InputRow label="NAT Data processed" unit="GB/mo" value={natDataGb} onChange={setNatDataGb} />
              <InputRow label="Load Balancer hours" unit="hrs/mo" value={lbHours} onChange={setLbHours} />
              <InputRow label="CDN data transfer" unit="GB/mo" value={cdnGb} onChange={setCdnGb} />
              <InputRow label="Internet egress" unit="GB/mo" value={egressGb} onChange={setEgressGb} />
              <InputRow label="DNS hosted zones" unit="zones" value={dnsZones} onChange={setDnsZones} />
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={vpnEnabled} onChange={e => setVpnEnabled(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm">Include VPN Gateway (1 gateway, 24/7)</span>
              </label>
            </div>
          </div>

          {/* Kubernetes */}
          <div className="provider-card rounded-xl p-6 shadow">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span>⚙️</span> Kubernetes
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={k8sEnabled} onChange={e => setK8sEnabled(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm">Include K8s</span>
              </label>
            </div>
            {k8sEnabled && (
              <div className="space-y-4">
                <InputRow label="Clusters" unit="clusters" value={k8sClusters} onChange={setK8sClusters} min={1} />
                <InputRow label="Worker nodes (medium)" unit="nodes" value={k8sNodes} onChange={setK8sNodes} min={1} />
                <p className="text-xs opacity-40">Node pricing based on ~2vCPU/4GB equivalent. Azure control plane is free.</p>
              </div>
            )}
            {!k8sEnabled && <p className="text-sm opacity-40">Enable to include managed Kubernetes costs.</p>}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Chart */}
          <div className="provider-card rounded-xl p-6 shadow" style={{ height: 320 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(costs).map(([p, c]) => (
              <div key={p} className="provider-card rounded-xl p-4 shadow text-center" style={{ borderTopColor: PROVIDERS[p].color, borderTopWidth: 2 }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: PROVIDERS[p].color }}>{PROVIDERS[p].label}</p>
                <p className="text-2xl font-bold">${c.total.toLocaleString()}</p>
                <p className="text-xs opacity-50">/month</p>
                {p === cheapest && (
                  <span className="inline-block mt-2 text-xs bg-green-500 text-white rounded-full px-2 py-0.5">Lowest</span>
                )}
                <div className="mt-3 text-xs opacity-60 space-y-1 text-left">
                  <div className="flex justify-between"><span>Networking</span><span>${c.net.toLocaleString()}</span></div>
                  {k8sEnabled && <div className="flex justify-between"><span>Kubernetes</span><span>${c.k8s.toLocaleString()}</span></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CostCalculator;
