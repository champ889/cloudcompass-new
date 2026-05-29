import React, { useState, useEffect } from 'react';
import AUGPUPricing from './AUGPUPricing';

const PROVIDERS = ['SharonAI', 'Firmus'];
const TABS = ['Overview', 'Infrastructure', 'Sovereignty', 'Kubernetes', 'Inference', 'Pros & Cons', 'Matrix'];

const TickIcon = () => (
  <svg className="w-4 h-4 text-green-500 inline mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon = () => (
  <svg className="w-4 h-4 text-red-400 inline mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = ({ ok }) => ok
  ? <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
  : <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

const AUAICloud = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    fetch('/api/auaicloud')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch'); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-20 opacity-60">Loading Australian AI cloud data...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  if (!data) return null;

  const providers = data.providers;

  return (
    <section id="auaicloud" className="py-20">
      <div className="text-center mb-12">
        <div className="inline-block mb-4 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
          style={{ backgroundColor: '#00843D22', color: '#00843D' }}>
          🇦🇺 Australian Sovereign AI
        </div>
        <h2 className="text-3xl font-bold mb-3">Australian AI Cloud Providers</h2>
        <p className="opacity-60 max-w-2xl mx-auto">
          Homegrown GPU infrastructure purpose-built for Australian sovereignty, compliance, and enterprise AI — Sharon AI and Firmus compared.
        </p>
        <p className="text-xs opacity-30 mt-2">Both providers are enterprise-only with no public self-serve pricing. Data based on May 2026 public announcements.</p>
      </div>

      {/* Market context banner */}
      {data.marketContext && (
        <div className="provider-card rounded-xl p-5 mb-10 shadow border-l-4" style={{ borderLeftColor: '#00843D' }}>
          <p className="text-sm font-semibold mb-3">{data.marketContext.headline}</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
            {data.marketContext.stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-xs font-bold text-green-400">{s.value}</p>
                <p className="text-xs opacity-50">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs opacity-40">{data.marketContext.note}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`service-pill ${activeTab === tab ? 'active' : ''}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'Overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {PROVIDERS.map(p => {
            const pData = providers[p];
            return (
              <div key={p} className="provider-card rounded-xl p-6 shadow-lg border flex flex-col"
                style={{ borderTopColor: pData.color, borderTopWidth: 3 }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
                    style={{ backgroundColor: pData.color + '22', color: pData.color }}>
                    {p}
                  </span>
                  <span className="text-xs opacity-50">{pData.ticker}</span>
                </div>
                <p className="text-lg font-semibold mb-1">{pData.tagline}</p>
                <p className="text-xs opacity-50 mb-3">{pData.headquarters}</p>
                <p className="text-sm opacity-70 leading-relaxed mb-4 flex-1">{pData.overview}</p>

                <div className="border-t border-gray-700 pt-4 space-y-2">
                  <div>
                    <p className="text-xs opacity-40 mb-1">Data centres</p>
                    <div className="flex flex-wrap gap-1">
                      {pData.datacentres.map(dc => (
                        <span key={dc} className="text-xs px-2 py-0.5 rounded"
                          style={{ backgroundColor: pData.color + '22', color: pData.color }}>
                          {dc}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs opacity-40 mb-1">GPU fleet</p>
                    <div className="flex flex-wrap gap-1">
                      {pData.gpus.map(g => (
                        <span key={g} className="text-xs px-2 py-0.5 rounded bg-gray-700 opacity-80">{g}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pricing-note rounded-lg p-3 text-xs opacity-70 mt-2">
                    <span className="font-semibold">Pricing: </span>{pData.pricing.notes}
                  </div>
                </div>
                <a href={pData.website} target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-4 text-xs font-medium hover:underline"
                  style={{ color: pData.color }}>
                  Visit website →
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Infrastructure */}
      {activeTab === 'Infrastructure' && (
        <div className="grid md:grid-cols-2 gap-6">
          {PROVIDERS.map(p => {
            const pData = providers[p];
            const net = pData.networking;
            return (
              <div key={p} className="provider-card rounded-xl p-6 shadow-lg border"
                style={{ borderTopColor: pData.color, borderTopWidth: 3 }}>
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
                    style={{ backgroundColor: pData.color + '22', color: pData.color }}>
                    {p}
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs opacity-40 mb-1">Interconnect</p>
                    <p className="text-sm font-semibold">{net.interconnect}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-40 mb-1">Bandwidth</p>
                    <p className="text-sm font-semibold">{net.bandwidth}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-40 mb-1">Direct Connect</p>
                    <p className="text-sm font-semibold">{net.directConnect}</p>
                  </div>
                </div>
                <div className="pricing-note rounded-lg p-3 text-xs opacity-70 mt-4">{net.notes}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sovereignty */}
      {activeTab === 'Sovereignty' && (
        <div className="grid md:grid-cols-2 gap-6">
          {PROVIDERS.map(p => {
            const pData = providers[p];
            const sov = pData.sovereignty;
            return (
              <div key={p} className="provider-card rounded-xl p-6 shadow-lg border"
                style={{ borderTopColor: pData.color, borderTopWidth: 3 }}>
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
                    style={{ backgroundColor: pData.color + '22', color: pData.color }}>
                    {p}
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs opacity-40 mb-1">Data Residency</p>
                    <p className="text-sm font-semibold">{sov.dataResidency}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-40 mb-1">Certifications</p>
                    <div className="flex flex-wrap gap-1">
                      {sov.certifications.map(c => (
                        <span key={c} className="text-xs px-2 py-0.5 rounded"
                          style={{ backgroundColor: pData.color + '22', color: pData.color }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-40">Government-ready</span>
                    <span style={{ color: sov.governmentReady ? '#22c55e' : '#f87171' }} className="text-sm font-semibold">
                      {sov.governmentReady ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                </div>
                <div className="pricing-note rounded-lg p-3 text-xs opacity-70 mt-4">{sov.notes}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Kubernetes */}
      {activeTab === 'Kubernetes' && (
        <div className="grid md:grid-cols-2 gap-6">
          {PROVIDERS.map(p => {
            const pData = providers[p];
            const k8s = pData.kubernetes;
            return (
              <div key={p} className="provider-card rounded-xl p-6 shadow-lg border"
                style={{ borderTopColor: pData.color, borderTopWidth: 3 }}>
                <div className="mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
                    style={{ backgroundColor: pData.color + '22', color: pData.color }}>
                    {p}
                  </span>
                </div>
                <p className="text-sm font-semibold mb-4">{k8s.service}</p>
                <div className="space-y-1 mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    {k8s.managed ? <TickIcon /> : <CrossIcon />}
                    <span>Managed control plane</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {k8s.bareMetal ? <TickIcon /> : <CrossIcon />}
                    <span>Bare-metal GPU access</span>
                  </div>
                </div>
                <ul className="space-y-1 mb-4">
                  {k8s.features.map((f, i) => (
                    <li key={i} className="text-xs flex items-start gap-1">
                      <TickIcon />{f}
                    </li>
                  ))}
                </ul>
                <div className="pricing-note rounded-lg p-3 text-xs opacity-70">{k8s.notes}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inference */}
      {activeTab === 'Inference' && (
        <div className="grid md:grid-cols-2 gap-6">
          {PROVIDERS.map(p => {
            const pData = providers[p];
            const inf = pData.inference;
            return (
              <div key={p} className="provider-card rounded-xl p-6 shadow-lg border"
                style={{ borderTopColor: pData.color, borderTopWidth: 3, opacity: inf.available ? 1 : 0.65 }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
                    style={{ backgroundColor: pData.color + '22', color: pData.color }}>
                    {p}
                  </span>
                  {inf.available
                    ? <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">Early access</span>
                    : <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded-full">Not yet</span>
                  }
                </div>
                <p className="text-sm font-semibold mb-1">{inf.product}</p>
                <p className="text-xs opacity-50 mb-4">{inf.type}</p>
                <div className="pricing-note rounded-lg p-3 text-xs opacity-70 mb-4">{inf.notes}</div>
                <a href={inf.link} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-medium hover:underline"
                  style={{ color: pData.color }}>
                  Learn more →
                </a>
              </div>
            );
          })}
          <div className="md:col-span-2 pricing-note rounded-xl p-4 text-sm opacity-60 text-center">
            💡 Both Australian providers are currently infrastructure-focused. For managed inference in Australia, consider Nebius (EU/US) or RunPod — both accessible from Australia with no egress fees.
          </div>
        </div>
      )}

      {/* Pros & Cons */}
      {activeTab === 'Pros & Cons' && (
        <div className="grid md:grid-cols-2 gap-6">
          {PROVIDERS.map(p => {
            const pData = providers[p];
            return (
              <div key={p} className="provider-card rounded-xl p-6 shadow-lg border"
                style={{ borderTopColor: pData.color, borderTopWidth: 3 }}>
                <h3 className="font-bold text-lg mb-1" style={{ color: pData.color }}>{p}</h3>
                <p className="text-xs opacity-50 mb-5 italic">{pData.bestFor}</p>
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-widest text-green-500 mb-2">Strengths</p>
                  <ul className="space-y-1">
                    {pData.pros.map((pro, i) => (
                      <li key={i} className="text-xs flex items-start gap-1"><TickIcon />{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-red-400 mb-2">Limitations</p>
                  <ul className="space-y-1">
                    {pData.cons.map((con, i) => (
                      <li key={i} className="text-xs flex items-start gap-1"><CrossIcon />{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Matrix */}
      {activeTab === 'Matrix' && (
        <div className="overflow-x-auto rounded-xl shadow">
          <table className="min-w-full comparison-table text-sm">
            <thead>
              <tr>
                <th className="p-4 text-left">Capability</th>
                {PROVIDERS.map(p => (
                  <th key={p} className="p-4 text-center" style={{ color: providers[p].color }}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.comparisonMatrix).map(([feature, vals]) => (
                <tr key={feature}>
                  <td className="p-4 font-medium opacity-70">{feature}</td>
                  {PROVIDERS.map(p => (
                    <td key={p} className="p-4 text-center">
                      <div className="flex justify-center"><CheckIcon ok={vals[p]} /></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* GPU Pricing Calculator — always visible at bottom */}
      <AUGPUPricing />

    </section>
  );
};

export default AUAICloud;
