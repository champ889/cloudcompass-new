import React, { useState, useEffect } from 'react';
import AICloudCalculator from './AICloudCalculator';

const PROVIDERS = ['CoreWeave', 'Lambda', 'RunPod', 'Nebius'];
const TABS = ['Overview', 'GPU Pricing', 'Networking', 'Kubernetes', 'Inference', 'Pros & Cons', 'Matrix'];

const CheckIcon = ({ ok }) => ok
  ? <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
  : <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

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

const AICloud = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    fetch('/api/aicloud')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch'); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-20 opacity-60">Loading AI cloud data...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  if (!data) return null;

  const providers = data.providers;

  return (
    <section id="aicloud" className="py-20">
      <div className="text-center mb-12">
        <div className="inline-block mb-4 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
          style={{ backgroundColor: '#76b90022', color: '#76b900' }}>
          AI-Optimised Cloud
        </div>
        <h2 className="text-3xl font-bold mb-3">AI Cloud Providers</h2>
        <p className="opacity-60 max-w-2xl mx-auto">
          GPU-first infrastructure built for AI training and inference — CoreWeave, Lambda, RunPod, and Nebius compared across compute, networking, and Kubernetes.
        </p>
        <p className="text-xs opacity-30 mt-2">Pricing estimates only — verify with each provider before provisioning.</p>
      </div>

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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROVIDERS.map(p => {
            const pData = providers[p];
            return (
              <div key={p} className="provider-card rounded-xl p-5 shadow-lg border flex flex-col"
                style={{ borderTopColor: pData.color, borderTopWidth: 3 }}>
                <div className="mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
                    style={{ backgroundColor: pData.color + '22', color: pData.color }}>
                    {p}
                  </span>
                </div>
                <p className="text-sm font-semibold mb-1">{pData.tagline}</p>
                <p className="text-xs opacity-60 leading-relaxed mb-4 flex-1">{pData.overview}</p>
                <div className="text-xs opacity-50 space-y-1 border-t border-gray-700 pt-3">
                  <div className="flex justify-between"><span>Founded</span><span>{pData.founded}</span></div>
                  <div className="flex justify-between"><span>Listed</span><span>{pData.ticker}</span></div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pData.gpus.map(g => (
                      <span key={g} className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: pData.color + '22', color: pData.color }}>{g}</span>
                    ))}
                  </div>
                </div>
                <a href={pData.website} target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-3 text-xs font-medium hover:underline"
                  style={{ color: pData.color }}>
                  Visit website →
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* GPU Pricing */}
      {activeTab === 'GPU Pricing' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROVIDERS.map(p => {
            const pData = providers[p];
            const pr = pData.pricing;
            const cheapestH100 = Math.min(...PROVIDERS.map(x => providers[x].pricing.h100PerHour));
            return (
              <div key={p} className="provider-card rounded-xl p-5 shadow-lg border"
                style={{ borderTopColor: pData.color, borderTopWidth: 3 }}>
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
                    style={{ backgroundColor: pData.color + '22', color: pData.color }}>
                    {p}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-60">A100/GPU</span>
                    <span className="text-sm font-mono font-semibold">${pr.a100PerHour}/hr</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-60">H100/GPU</span>
                    <div className="flex items-center gap-1">
                      {pr.h100PerHour === cheapestH100 && (
                        <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">Lowest</span>
                      )}
                      <span className="text-sm font-mono font-semibold">${pr.h100PerHour}/hr</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-60">H200/GPU</span>
                    <span className="text-sm font-mono font-semibold">
                      {pr.h200PerHour ? `$${pr.h200PerHour}/hr` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-60">Egress/GB</span>
                    <span className="text-sm font-mono font-semibold"
                      style={{ color: pr.egressPerGb === 0 ? '#22c55e' : 'inherit' }}>
                      {pr.egressPerGb === 0 ? 'Free' : `$${pr.egressPerGb}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-60">Billing</span>
                    <span className="text-xs font-semibold">{pr.billingUnit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-60">Reserved</span>
                    <span className="text-xs font-semibold text-right max-w-32">{pr.reservedDiscount}</span>
                  </div>
                </div>

                <div className="pricing-note rounded-lg p-3 text-xs opacity-70">
                  {pr.notes}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Networking */}
      {activeTab === 'Networking' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROVIDERS.map(p => {
            const pData = providers[p];
            const net = pData.networking;
            return (
              <div key={p} className="provider-card rounded-xl p-5 shadow-lg border"
                style={{ borderTopColor: pData.color, borderTopWidth: 3 }}>
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
                    style={{ backgroundColor: pData.color + '22', color: pData.color }}>
                    {p}
                  </span>
                </div>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs opacity-40 mb-1">Interconnect</p>
                    <p className="text-sm font-semibold">{net.interconnect}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-40 mb-1">Bandwidth</p>
                    <p className="text-sm font-semibold">{net.bandwidth}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-40 mb-1">Egress</p>
                    <p className="text-sm font-semibold" style={{ color: net.egress === 'Free' ? '#22c55e' : 'inherit' }}>
                      {net.egress}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs opacity-40 mb-1">Direct Connect</p>
                    <p className="text-sm font-semibold">{net.directConnect}</p>
                  </div>
                  {net.dpu && net.dpu !== 'None' && net.dpu !== 'None listed' && (
                    <div>
                      <p className="text-xs opacity-40 mb-1">DPU</p>
                      <p className="text-sm font-semibold">{net.dpu}</p>
                    </div>
                  )}
                </div>
                <div className="pricing-note rounded-lg p-3 text-xs opacity-70">{net.notes}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Kubernetes */}
      {activeTab === 'Kubernetes' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROVIDERS.map(p => {
            const pData = providers[p];
            const k8s = pData.kubernetes;
            return (
              <div key={p} className="provider-card rounded-xl p-5 shadow-lg border"
                style={{ borderTopColor: pData.color, borderTopWidth: 3 }}>
                <div className="mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
                    style={{ backgroundColor: pData.color + '22', color: pData.color }}>
                    {p}
                  </span>
                </div>
                <p className="text-sm font-semibold mb-3">{k8s.service}</p>
                <div className="space-y-1 mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    {k8s.managed ? <TickIcon /> : <CrossIcon />}
                    <span>Managed control plane</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {k8s.bareMetal ? <TickIcon /> : <CrossIcon />}
                    <span>Bare-metal (no hypervisor)</span>
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
        <div className="space-y-6">
          {/* Summary row */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROVIDERS.map(p => {
              const pData = providers[p];
              const inf = pData.inference;
              if (!inf) return null;
              return (
                <div key={p} className="provider-card rounded-xl p-5 shadow-lg border"
                  style={{ borderTopColor: pData.color, borderTopWidth: 3, opacity: inf.available ? 1 : 0.5 }}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
                      style={{ backgroundColor: pData.color + '22', color: pData.color }}>
                      {p}
                    </span>
                    {inf.available
                      ? <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Available</span>
                      : <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded-full">None</span>
                    }
                  </div>

                  <p className="text-sm font-semibold mb-1">{inf.product}</p>
                  <p className="text-xs opacity-50 mb-4">{inf.type}</p>

                  {inf.available ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="opacity-50">Pricing</span>
                        <span className="font-medium text-right max-w-32">{inf.pricingModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-50">Cold start</span>
                        <span className="font-medium">{inf.coldStart}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-50">Scale to zero</span>
                        <span style={{ color: inf.scaleToZero ? '#22c55e' : '#f87171' }}>
                          {inf.scaleToZero ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-50">OpenAI API</span>
                        <span style={{ color: inf.openAICompatible ? '#22c55e' : '#f87171' }}>
                          {inf.openAICompatible ? 'Compatible' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-50">Self-serve</span>
                        <span style={{ color: inf.selfServe ? '#22c55e' : '#f87171' }}>
                          {inf.selfServe ? 'Yes' : 'Enterprise only'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-50">Models</span>
                        <span className="font-medium">{inf.modelCount}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs opacity-50 leading-relaxed">{inf.notes}</p>
                  )}

                  {inf.available && (
                    <>
                      <div className="pricing-note rounded-lg p-3 text-xs opacity-70 mt-4">
                        {inf.notes}
                      </div>
                      <a href={inf.link} target="_blank" rel="noopener noreferrer"
                        className="inline-block mt-3 text-xs font-medium hover:underline"
                        style={{ color: pData.color }}>
                        Learn more →
                      </a>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Inference matrix */}
          <div className="overflow-x-auto rounded-xl shadow mt-6">
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
                {[
                  ['Managed inference', p => providers[p].inference?.available],
                  ['Self-serve signup', p => providers[p].inference?.selfServe],
                  ['OpenAI-compatible API', p => providers[p].inference?.openAICompatible],
                  ['Scale to zero', p => providers[p].inference?.scaleToZero],
                  ['Batch inference', p => providers[p].inference?.batchInference],
                  ['Streaming support', p => providers[p].inference?.streamingSupport],
                  ['Production SLA', p => !!providers[p].inference?.sla && providers[p].inference?.sla !== 'N/A'],
                ].map(([label, fn]) => (
                  <tr key={label}>
                    <td className="p-4 font-medium opacity-70">{label}</td>
                    {PROVIDERS.map(p => (
                      <td key={p} className="p-4 text-center">
                        <div className="flex justify-center">
                          {fn(p)
                            ? <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            : <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          }
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pros & Cons */}
      {activeTab === 'Pros & Cons' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROVIDERS.map(p => {
            const pData = providers[p];
            return (
              <div key={p} className="provider-card rounded-xl p-5 shadow-lg border"
                style={{ borderTopColor: pData.color, borderTopWidth: 3 }}>
                <h3 className="font-bold text-sm mb-1" style={{ color: pData.color }}>{p}</h3>
                <p className="text-xs opacity-50 mb-4 italic">{pData.bestFor}</p>
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-widest text-green-500 mb-2">Strengths</p>
                  <ul className="space-y-1">
                    {pData.pros.map((pro, i) => (
                      <li key={i} className="text-xs flex items-start gap-1">
                        <TickIcon />{pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-red-400 mb-2">Limitations</p>
                  <ul className="space-y-1">
                    {pData.cons.map((con, i) => (
                      <li key={i} className="text-xs flex items-start gap-1">
                        <CrossIcon />{con}
                      </li>
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
                  <th key={p} className="p-4 text-center" style={{ color: providers[p].color }}>
                    {p}
                  </th>
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
      {/* Calculator always visible below tabs */}
      <AICloudCalculator />

    </section>
  );
};

export default AICloud;
