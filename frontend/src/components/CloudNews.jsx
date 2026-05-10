import React, { useState, useEffect } from 'react';

const PROVIDERS = ['All', 'AWS', 'Azure', 'GCP'];
const PROVIDER_COLORS = { AWS: '#FF9900', Azure: '#0078D4', GCP: '#4285F4' };

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  if (days > 30) return new Date(dateStr).toLocaleDateString();
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
}

const CloudNews = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch('/api/news')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch'); return r.json(); })
      .then(d => {
        setItems(d.items);
        setLastUpdated(d.lastUpdated);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const filtered = filter === 'All' ? items : items.filter(i => i.provider === filter);

  return (
    <section id="news" className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">Cloud Updates</h2>
        <p className="opacity-60 max-w-2xl mx-auto">
          Latest networking and Kubernetes updates from AWS, Azure, and Google Cloud — refreshed every 6 hours.
        </p>
        {lastUpdated && (
          <p className="text-xs opacity-30 mt-2">
            Last refreshed: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {PROVIDERS.map(p => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`service-pill ${filter === p ? 'active' : ''}`}
            style={filter === p && p !== 'All' ? { borderColor: PROVIDER_COLORS[p], color: PROVIDER_COLORS[p] } : {}}
          >
            {p}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-20 opacity-60">
          <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p>Fetching latest updates...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-400">
          Failed to load updates. Check back soon.
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 opacity-40">No updates found for this provider.</div>
      )}

      {!loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, i) => (
            <div
              key={i}
              className="provider-card rounded-xl p-5 shadow cursor-pointer hover:shadow-lg transition-shadow"
              style={{ borderLeftColor: PROVIDER_COLORS[item.provider], borderLeftWidth: 3 }}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                  style={{ backgroundColor: PROVIDER_COLORS[item.provider] + '22', color: PROVIDER_COLORS[item.provider] }}
                >
                  {item.provider}
                </span>
                <span className="text-xs opacity-40">{timeAgo(item.date)}</span>
              </div>

              <h3 className="text-sm font-semibold leading-snug mb-2 line-clamp-2">
                {item.title}
              </h3>

              <p className="text-xs opacity-50 mb-1">{item.label}</p>

              {expanded === i && item.snippet && (
                <p className="text-xs opacity-60 mt-3 leading-relaxed border-t border-gray-700 pt-3">
                  {item.snippet}...
                </p>
              )}

              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-xs font-medium hover:underline"
                style={{ color: PROVIDER_COLORS[item.provider] }}
                onClick={e => e.stopPropagation()}
              >
                Read more →
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CloudNews;
