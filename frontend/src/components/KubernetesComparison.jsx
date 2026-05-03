import React, { useState, useEffect } from 'react';

const PROVIDERS = ['AWS', 'Azure', 'GCP'];
const PROVIDER_COLORS = { AWS: '#FF9900', Azure: '#0078D4', GCP: '#4285F4' };

const CheckIcon = ({ ok }) => ok
  ? <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
  : <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

const TABS = ['Overview', 'Features', 'Pricing', 'Pros & Cons', 'Matrix'];

const KubernetesComparison = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    fetch('/api/kubernetes')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch'); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-20 opacity-60">Loading Kubernetes data...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  if (!data) return null;

  return (
    <section id="kubernetes" className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">Kubernetes Comparison</h2>
        <p className="opacity-60 max-w-2xl mx-auto">EKS vs AKS vs GKE — managed Kubernetes across the three hyperscalers.</p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`service-pill ${activeTab === tab ? 'active' : ''}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'Overview' && (
        <div className="grid md:grid-cols-3 gap-6">
          {PROVIDERS.map(p => {
            const pData = data.providers[p];
            return (
              <div key={p} className="provider-card rounded-xl p-6 shadow-lg border" style={{ borderTopColor: PROVIDER_COLORS[p], borderTopWidth: 3 }}>
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded" style={{ backgroundColor: PROVIDER_COLORS[p] + '22', color: PROVIDER_COLORS[p] }}>
                    {p}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{pData.service}</h3>
                <p className="text-sm opacity-50 mb-4">{pData.fullName}</p>
                <p className="text-sm opacity-75 leading-relaxed">{pData.overview}</p>
                <a href={pData.docs} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-xs font-medium hover:underline" style={{ color: PROVIDER_COLORS[p] }}>
                  Official Docs →
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Features Tab */}
      {activeTab === 'Features' && (
        <div className="overflow-x-auto rounded-xl shadow">
          <table className="min-w-full comparison-table text-sm">
            <thead>
              <tr>
                <th className="p-4 text-left w-48">Feature</th>
                {PROVIDERS.map(p => (
                  <th key={p} className="p-4 text-center" style={{ color: PROVIDER_COLORS[p] }}>
                    {data.providers[p].service}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.providers.AWS.features).map(([key, _]) => (
                <tr key={key}>
                  <td className="p-4 font-medium opacity-70 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                  {PROVIDERS.map(p => {
                    const val = data.providers[p].features[key];
                    const isBool = typeof val === 'boolean';
                    return (
                      <td key={p} className="p-4 text-center align-middle">
                        {isBool
                          ? <div className="flex justify-center"><CheckIcon ok={val} /></div>
                          : <span className="text-xs">{val}</span>
                        }
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pricing Tab */}
      {activeTab === 'Pricing' && (
        <div className="grid md:grid-cols-3 gap-6">
          {PROVIDERS.map(p => {
            const pData = data.providers[p];
            const cp = pData.clusterPricing;
            const np = pData.nodePricing;
            return (
              <div key={p} className="provider-card rounded-xl p-6 shadow-lg border" style={{ borderTopColor: PROVIDER_COLORS[p], borderTopWidth: 3 }}>
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded" style={{ backgroundColor: PROVIDER_COLORS[p] + '22', color: PROVIDER_COLORS[p] }}>
                    {pData.service}
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Control Plane</p>
                  <div className="text-3xl font-bold mb-1">
                    {cp.controlPlanePerMonth === 0
                      ? <span className="text-green-500">FREE</span>
                      : <span>${cp.controlPlanePerMonth}<span className="text-base font-normal opacity-50">/mo</span></span>
                    }
                  </div>
                  <p className="text-xs opacity-50">{cp.notes}</p>
                </div>

                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Worker Nodes (examples)</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="opacity-70">Small</span><span className="font-mono">${np.smallPerHour}/hr</span></div>
                    <div className="flex justify-between"><span className="opacity-70">Medium</span><span className="font-mono">${np.mediumPerHour}/hr</span></div>
                    <div className="flex justify-between"><span className="opacity-70">Large</span><span className="font-mono">${np.largePerHour}/hr</span></div>
                  </div>
                  <p className="text-xs opacity-40 mt-2">{np.notes}</p>
                </div>

                {pData.fargatePerVCPUHour > 0 && (
                  <div className="pricing-note rounded-lg p-3 text-xs">
                    <p className="font-semibold mb-1">Serverless (Fargate/Autopilot)</p>
                    <p className="opacity-70">${pData.fargatePerVCPUHour}/vCPU-hr + ${pData.fargatePerGBHour}/GB-hr</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pros & Cons Tab */}
      {activeTab === 'Pros & Cons' && (
        <div className="grid md:grid-cols-3 gap-6">
          {PROVIDERS.map(p => {
            const pData = data.providers[p];
            return (
              <div key={p} className="provider-card rounded-xl p-6 shadow-lg border" style={{ borderTopColor: PROVIDER_COLORS[p], borderTopWidth: 3 }}>
                <h3 className="font-bold text-lg mb-4" style={{ color: PROVIDER_COLORS[p] }}>{pData.service}</h3>
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-widest text-green-500 mb-2">Strengths</p>
                  <ul className="space-y-2">
                    {pData.pros.map((pro, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-red-400 mb-2">Limitations</p>
                  <ul className="space-y-2">
                    {pData.cons.map((con, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Matrix Tab */}
      {activeTab === 'Matrix' && (
        <div className="overflow-x-auto rounded-xl shadow">
          <table className="min-w-full comparison-table text-sm">
            <thead>
              <tr>
                <th className="p-4 text-left">Capability</th>
                {PROVIDERS.map(p => (
                  <th key={p} className="p-4 text-center" style={{ color: PROVIDER_COLORS[p] }}>
                    {data.providers[p].service}
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
    </section>
  );
};

export default KubernetesComparison;
