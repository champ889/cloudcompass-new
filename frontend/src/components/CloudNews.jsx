import React, { useState, useEffect } from 'react';

const PROVIDER_COLORS = {
  AWS: '#FF9900',
  Azure: '#0078D4',
  GCP: '#4285F4',
  Kubernetes: '#326CE5',
  CNCF: '#446CA9',
  Istio: '#466BB0',
  Cilium: '#F8C517',
  Helm: '#0F1689',
  Argo: '#EF7B4D',
  Flux: '#5468FF',
  'Gateway API': '#326CE5',
  Karpenter: '#FF9900',
  'FinOps Foundation': '#0095DA',
  'AWS FinOps': '#FF9900',
  'Azure FinOps': '#0078D4',
  'Azure Cost Management': '#0078D4',
  'GCP FinOps': '#4285F4',
  FOCUS: '#0095DA',
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  if (days > 60) return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
}

const CloudNews = ({ topic, title = 'Cloud Updates' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFilter('All');
    const url = topic ? `/api/news?topic=${topic}` : '/api/news';
    fetch(url)
      .then(r => { if (!r.ok) throw new Error('Failed to fetch'); return r.json(); })
      .then(d => { setItems(d.items || []); setLastUpdated(d.lastUpdated); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [topic]);

  const providerList = ['All', ...Array.from(new Set(items.map(i => i.provider))).sort()];
  const filtered = filter === 'All' ? items : items.filter(i => i.provider === filter);
  const visible = showAll ? filtered : filtered.slice(0, 12);

  const subtitle = topic === 'networking'
    ? 'Latest networking updates from AWS, Azure, and Google Cloud.'
    : topic === 'ai'
    ? 'Latest GPU, AI infrastructure, and inference updates from AWS, Azure, and Google Cloud.'
    : topic === 'kubernetes'
    ? 'Latest Kubernetes, CNCF, and cloud native updates from the community.'
    : topic === 'finops'
    ? 'Latest FinOps, cloud cost management, and FOCUS spec updates from official sources.'
    : 'Latest cloud updates.';

  return (
    <section id="news" className="py-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="opacity-60 text-sm max-w-xl mx-auto">{subtitle} Refreshed every 6 hours.</p>
        {lastUpdated && (
          <p className="text-xs opacity-30 mt-1">
            Last refreshed: {new Date(lastUpdated).toLocaleString('en-AU')}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {providerList.map(p => (
          <button
            key={p}
            onClick={() => { setFilter(p); setShowAll(false); }}
            className={`service-pill ${filter === p ? 'active' : ''}`}
            style={filter === p && p !== 'All' ? { borderColor: PROVIDER_COLORS[p] || '#888', color: PROVIDER_COLORS[p] || '#888' } : {}}
          >
            {p}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-16 opacity-60">
          <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Fetching latest updates...</p>
        </div>
      )}

      {error && <div className="text-center py-16 text-red-400 text-sm">Failed to load updates. Check back soon.</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 opacity-40 text-sm">No updates found.</div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="provider-card rounded-xl p-4 shadow hover:shadow-lg transition-all hover:-translate-y-0.5 flex flex-col no-underline"
                style={{ borderLeftColor: PROVIDER_COLORS[item.provider] || '#888', borderLeftWidth: 3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                    style={{ backgroundColor: (PROVIDER_COLORS[item.provider] || '#888') + '22', color: PROVIDER_COLORS[item.provider] || '#888' }}
                  >
                    {item.provider}
                  </span>
                  <span className="text-xs opacity-40">{timeAgo(item.date)}</span>
                </div>
                <h3 className="text-sm font-semibold leading-snug mb-1">{item.title}</h3>
                <p className="text-xs opacity-40 mb-2">{item.label}</p>
                {item.snippet && (
                  <p className="text-xs opacity-60 leading-relaxed flex-1 line-clamp-3">{item.snippet}</p>
                )}
                <p className="mt-3 text-xs font-medium" style={{ color: PROVIDER_COLORS[item.provider] || '#888' }}>
                  Read more →
                </p>
              </a>
            ))}
          </div>
          {filtered.length > 12 && (
            <div className="text-center mt-6">
              <button onClick={() => setShowAll(!showAll)} className="service-pill px-6">
                {showAll ? 'Show less' : `Show all ${filtered.length} updates`}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default CloudNews;
