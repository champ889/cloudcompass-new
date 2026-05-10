const express = require('express');
const Router = express.Router();
const Parser = require('rss-parser');

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail'],
  },
});

// RSS feeds per provider
const FEEDS = [
  {
    provider: 'AWS',
    color: '#FF9900',
    url: 'https://aws.amazon.com/blogs/networking-and-content-delivery/feed/',
    label: 'Networking & CDN',
  },
  {
    provider: 'AWS',
    color: '#FF9900',
    url: 'https://aws.amazon.com/blogs/containers/feed/',
    label: 'Containers',
  },
  {
    provider: 'Azure',
    color: '#0078D4',
    url: 'https://azure.microsoft.com/en-us/blog/feed/',
    label: 'Azure Blog',
  },
  {
    provider: 'GCP',
    color: '#4285F4',
    url: 'https://cloud.google.com/feeds/kubernetes-engine-release-notes.xml',
    label: 'GKE Release Notes',
  },
  {
    provider: 'GCP',
    color: '#4285F4',
    url: 'https://cloud.google.com/feeds/gcp-release-notes.xml',
    label: 'GCP Release Notes',
  },
];

const KEYWORDS = [
  'kubernetes', 'eks', 'aks', 'gke', 'networking', 'vpc', 'load balancer',
  'cdn', 'dns', 'vpn', 'firewall', 'nat', 'ingress', 'egress', 'container',
  'cluster', 'node', 'pod', 'helm', 'istio', 'service mesh', 'network policy',
  'direct connect', 'expressroute', 'interconnect', 'cloudfront', 'waf',
];

// In-memory cache
let cache = { data: null, lastFetched: null };
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function matchesKeywords(text = '') {
  const lower = text.toLowerCase();
  return KEYWORDS.some(kw => lower.includes(kw));
}

async function fetchAllFeeds() {
  const results = [];

  await Promise.allSettled(
    FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        const filtered = parsed.items
          .filter(item => matchesKeywords(item.title) || matchesKeywords(item.contentSnippet))
          .slice(0, 5)
          .map(item => ({
            provider: feed.provider,
            color: feed.color,
            label: feed.label,
            title: item.title,
            link: item.link,
            date: item.pubDate || item.isoDate,
            snippet: item.contentSnippet?.slice(0, 200) || '',
          }));
        results.push(...filtered);
      } catch (err) {
        console.error(`Failed to fetch feed ${feed.url}:`, err.message);
      }
    })
  );

  // Sort by date descending
  return results.sort((a, b) => new Date(b.date) - new Date(a.date));
}

Router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    const cacheExpired = !cache.lastFetched || now - cache.lastFetched > CACHE_TTL_MS;

    if (cacheExpired || !cache.data) {
      console.log('Refreshing news feed cache...');
      cache.data = await fetchAllFeeds();
      cache.lastFetched = now;
    }

    res.json({
      lastUpdated: new Date(cache.lastFetched).toISOString(),
      items: cache.data,
    });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = Router;
