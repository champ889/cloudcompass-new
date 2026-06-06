import React, { useState, useEffect } from 'react';

const PROVIDERS = ['AWS', 'Azure', 'GCP'];
const PROVIDER_COLORS = { AWS: '#FF9900', Azure: '#0078D4', GCP: '#4285F4' };
const PROVIDER_LABELS = { AWS: 'AWS', Azure: 'Azure', GCP: 'Google Cloud' };

const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-500 inline mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const NetworkingComparison = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    fetch('/api/networking')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch'); return r.json(); })
      .then(d => {
        setData(d.categories);
        setActiveCategory(Object.keys(d.categories)[0]);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-20 opacity-60">Loading networking data...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  if (!data) return null;

  const categories = Object.keys(data);
  const current = data[activeCategory];

  return (
    <section id="networking" className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">Networking Comparison</h2>
        <p className="opacity-60 max-w-2xl mx-auto">AWS vs Azure vs Google Cloud — core networking services, features, and pricing at a glance.</p>
      </div>

      {/* Category tabs */}
      <div className="hidden md:flex flex-wrap justify-center gap-2 mb-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`service-pill ${activeCategory === cat ? 'active' : ''}`}
          >
            {data[cat].label}
          </button>
        ))}
      </div>
      <div className="md:hidden mb-8 px-4">
        <select
          className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={activeCategory}
          onChange={e => setActiveCategory(e.target.value)}
        >
          {categories.map(cat => <option key={cat} value={cat}>{data[cat].label}</option>)}
        </select>
      </div>

      {current && (
        <div className="px-2 md:px-0">
          <p className="text-center opacity-50 text-sm mb-8">{current.description}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {PROVIDERS.map(provider => {
              const p = current.providers[provider];
              if (!p) return null;
              return (
                <div key={provider} className="provider-card rounded-xl p-6 shadow-lg border" style={{ borderTopColor: PROVIDER_COLORS[provider], borderTopWidth: 3 }}>
                  <div className="flex items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded" style={{ backgroundColor: PROVIDER_COLORS[provider] + '22', color: PROVIDER_COLORS[provider] }}>
                      {PROVIDER_LABELS[provider]}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-4">{p.service}</h3>
                  <ul className="space-y-2 mb-6">
                    {p.highlights.map((h, i) => (
                      <li key={i} className="text-sm flex items-start">
                        <CheckIcon />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pricing-note rounded-lg p-3 text-xs opacity-70 mt-auto">
                    <span className="font-semibold">Pricing: </span>{p.pricing.notes}
                  </div>
                  <a href={p.docs} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-xs font-medium hover:underline" style={{ color: PROVIDER_COLORS[provider] }}>
                    Official Docs →
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default NetworkingComparison;
