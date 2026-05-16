const express = require('express');
const Router = express.Router();
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
  customFields: { item: ['media:content', 'media:thumbnail'] },
});

const FEEDS = [
  // ── AWS ──────────────────────────────────────────────────────────────────
  {
    provider: 'AWS', color: '#FF9900',
    url: 'https://aws.amazon.com/blogs/networking-and-content-delivery/feed/',
    label: 'Networking & CDN Blog',
  },
  {
    provider: 'AWS', color: '#FF9900',
    url: 'https://aws.amazon.com/blogs/containers/feed/',
    label: 'Containers Blog',
  },
  {
    provider: 'AWS', color: '#FF9900',
    url: 'https://aws.amazon.com/blogs/aws/feed/',
    label: 'AWS News Blog',
  },

  // ── Azure ─────────────────────────────────────────────────────────────────
  {
    provider: 'Azure', color: '#0078D4',
    url: 'https://github.com/Azure/AKS/releases.atom',
    label: 'AKS Release Notes',
  },
  {
    provider: 'Azure', color: '#0078D4',
    url: 'https://techcommunity.microsoft.com/plugins/custom/microsoft/o365/custom-blog-rss?tid=2&board=AzureNetworkingBlog&labels=&size=20',
    label: 'Azure Networking Blog',
  },
  {
    provider: 'Azure', color: '#0078D4',
    url: 'https://azurecomcdn.azureedge.net/en-us/blog/feed/',
    label: 'Azure Blog',
  },

  // ── GCP ───────────────────────────────────────────────────────────────────
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/kubernetes-engine-release-notes.xml',
    label: 'GKE Release Notes',
  },
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/virtual-private-cloud-release-notes.xml',
    label: 'VPC Release Notes',
  },
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/cloud-load-balancing-release-notes.xml',
    label: 'Cloud Load Balancing',
  },
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/cloud-cdn-release-notes.xml',
    label: 'Cloud CDN',
  },
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/cloud-dns-release-notes.xml',
    label: 'Cloud DNS',
  },
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/cloud-interconnect-release-notes.xml',
    label: 'Cloud Interconnect',
  },
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/networkintelligence-release-notes.xml',
    label: 'Network Intelligence',
  },
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/cloud-nat-release-notes.xml',
    label: 'Cloud NAT',
  },
];

const KEYWORDS = [
  'kubernetes', 'eks', 'aks', 'gke', 'networking', 'vpc', 'vnet',
  'load balancer', 'cdn', 'dns', 'vpn', 'firewall', 'nat', 'ingress',
  'egress', 'container', 'cluster', 'node pool', 'pod', 'helm', 'istio',
  'service mesh', 'network policy', 'direct connect', 'expressroute',
  'interconnect', 'cloudfront', 'waf', 'cilium', 'ebpf', 'cni',
  'karpenter', 'autoscal', 'gateway', 'subnet', 'peering', 'transit',
];

let cache = { data: null, lastFetched: null };
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

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
          .filter(item =>
            // GCP product feeds and AKS releases are always relevant
            feed.url.includes('cloud.google.com/feeds') ||
            feed.url.includes('AKS/releases') ||
            matchesKeywords(item.title) ||
            matchesKeywords(item.contentSnippet)
          )
          .slice(0, 6)
          .map(item => ({
            provider: feed.provider,
            color: feed.color,
            label: feed.label,
            title: item.title?.trim(),
            link: item.link,
            date: item.pubDate || item.isoDate,
            snippet: item.contentSnippet?.slice(0, 220) || '',
          }));
        results.push(...filtered);
      } catch (err) {
        console.error(`Failed to fetch ${feed.url}: ${err.message}`);
      }
    })
  );

  return results
    .filter(i => i.title && i.link)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

Router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    const expired = !cache.lastFetched || now - cache.lastFetched > CACHE_TTL_MS;

    if (expired || !cache.data) {
      console.log('Refreshing news feed cache...');
      cache.data = await fetchAllFeeds();
      cache.lastFetched = now;
    }

    res.json({ lastUpdated: new Date(cache.lastFetched).toISOString(), items: cache.data });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = Router;
