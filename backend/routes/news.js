const express = require('express');
const Router = express.Router();
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: ['media:content', 'media:thumbnail', 'content', 'summary'],
  },
});

// Strip HTML tags and decode basic entities
function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract a clean snippet from any item, handling GitHub atom HTML content
function extractSnippet(item, maxLength = 220) {
  const raw = item.contentSnippet || item.summary || item.content || '';
  const clean = stripHtml(raw);
  return clean.length > maxLength ? clean.slice(0, maxLength) + '…' : clean;
}

const FEEDS = [
  // ── AWS — Networking ────────────────────────────────────────────────────
  {
    provider: 'AWS', color: '#FF9900',
    url: 'https://aws.amazon.com/blogs/networking-and-content-delivery/feed/',
    label: 'Networking & CDN Blog',
    alwaysInclude: false,
  },
  // ── AWS — Kubernetes / Containers ──────────────────────────────────────
  {
    provider: 'AWS', color: '#FF9900',
    url: 'https://aws.amazon.com/blogs/containers/feed/',
    label: 'Containers Blog',
    alwaysInclude: false,
  },
  // ── AWS — EKS release notes (GitHub commits atom) ──────────────────────
  {
    provider: 'AWS', color: '#FF9900',
    url: 'https://github.com/awsdocs/amazon-eks-user-guide/commits/mainline/latest/ug/versioning/platform-versions.adoc.atom',
    label: 'EKS Platform Versions',
    alwaysInclude: true,
  },
  // ── AWS — EKS Auto Mode release notes ─────────────────────────────────
  {
    provider: 'AWS', color: '#FF9900',
    url: 'https://github.com/awsdocs/amazon-eks-user-guide/commits/mainline/latest/ug/automode/auto-change.adoc.atom',
    label: 'EKS Auto Mode',
    alwaysInclude: true,
  },
  // ── AWS — GPU / Accelerated Computing (What's New) ─────────────────────
  {
    provider: 'AWS', color: '#FF9900',
    url: 'https://aws.amazon.com/blogs/aws/feed/',
    label: 'AWS News (GPU & AI)',
    alwaysInclude: false,
  },
  // ── AWS — General What's New ───────────────────────────────────────────
  {
    provider: 'AWS', color: '#FF9900',
    url: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/',
    label: "What's New",
    alwaysInclude: false,
  },

  // ── Azure — AKS release notes (GitHub atom — best source) ─────────────
  {
    provider: 'Azure', color: '#0078D4',
    url: 'https://github.com/Azure/AKS/releases.atom',
    label: 'AKS Release Notes',
    alwaysInclude: true,
  },
  // ── Azure — Azure Updates (official product updates feed) ──────────────
  {
    provider: 'Azure', color: '#0078D4',
    url: 'https://azurecomcdn.azureedge.net/en-us/updates/feed/',
    label: 'Azure Updates',
    alwaysInclude: false,
  },
  // ── Azure — Azure Networking Tech Community Blog ───────────────────────
  {
    provider: 'Azure', color: '#0078D4',
    url: 'https://techcommunity.microsoft.com/plugins/custom/microsoft/o365/custom-blog-rss?tid=2&board=AzureNetworkingBlog&labels=&size=20',
    label: 'Azure Networking Blog',
    alwaysInclude: false,
  },
  // ── Azure — Microsoft Tech Community (Azure Infrastructure) ───────────
  {
    provider: 'Azure', color: '#0078D4',
    url: 'https://techcommunity.microsoft.com/plugins/custom/microsoft/o365/custom-blog-rss?tid=2&board=AzureInfrastructureBlog&labels=&size=20',
    label: 'Azure Infrastructure Blog',
    alwaysInclude: false,
  },
  // ── Azure — Azure Blog (GPU & AI) ──────────────────────────────────────
  {
    provider: 'Azure', color: '#0078D4',
    url: 'https://azurecomcdn.azureedge.net/en-us/blog/feed/',
    label: 'Azure Blog (GPU & AI)',
    alwaysInclude: false,
  },

  // ── GCP — GKE Release Notes ────────────────────────────────────────────
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/kubernetes-engine-release-notes.xml',
    label: 'GKE Release Notes',
    alwaysInclude: true,
  },
  // ── GCP — VPC Release Notes ────────────────────────────────────────────
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/virtual-private-cloud-release-notes.xml',
    label: 'VPC Release Notes',
    alwaysInclude: true,
  },
  // ── GCP — Cloud Load Balancing ─────────────────────────────────────────
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/cloud-load-balancing-release-notes.xml',
    label: 'Cloud Load Balancing',
    alwaysInclude: true,
  },
  // ── GCP — Cloud CDN ────────────────────────────────────────────────────
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/cloud-cdn-release-notes.xml',
    label: 'Cloud CDN',
    alwaysInclude: true,
  },
  // ── GCP — Cloud DNS ────────────────────────────────────────────────────
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/cloud-dns-release-notes.xml',
    label: 'Cloud DNS',
    alwaysInclude: true,
  },
  // ── GCP — Cloud Interconnect ───────────────────────────────────────────
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/cloud-interconnect-release-notes.xml',
    label: 'Cloud Interconnect',
    alwaysInclude: true,
  },
  // ── GCP — Cloud NAT ────────────────────────────────────────────────────
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/cloud-nat-release-notes.xml',
    label: 'Cloud NAT',
    alwaysInclude: true,
  },
  // ── GCP — GPU / Accelerator Release Notes ─────────────────────────────
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/compute-engine-release-notes.xml',
    label: 'Compute Engine (GPU)',
    alwaysInclude: false,
  },
  // ── GCP — Network Intelligence Center ─────────────────────────────────
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/networkintelligence-release-notes.xml',
    label: 'Network Intelligence',
    alwaysInclude: true,
  },
  // ── GCP — Vertex AI (GPU/AI workloads) ────────────────────────────────
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/vertex-ai-release-notes.xml',
    label: 'Vertex AI',
    alwaysInclude: false,
  },
];

const KEYWORDS = [
  // Kubernetes
  'kubernetes', 'eks', 'aks', 'gke', 'cluster', 'node pool', 'pod', 'helm',
  'istio', 'cilium', 'ebpf', 'cni', 'karpenter', 'autoscal', 'ingress',
  'service mesh', 'network policy', 'containerd', 'kubelet', 'kubeadm',
  // Networking
  'vpc', 'vnet', 'load balancer', 'cdn', 'dns', 'vpn', 'firewall', 'nat',
  'egress', 'gateway', 'subnet', 'peering', 'transit', 'direct connect',
  'expressroute', 'interconnect', 'cloudfront', 'waf', 'ddos', 'routing',
  'private link', 'private endpoint', 'nsg', 'acl', 'flow log',
  // GPU / AI compute
  'gpu', 'h100', 'h200', 'a100', 'b200', 'b300', 'blackwell', 'hopper',
  'nvidia', 'p4', 'p5', 'p6', 'inferenc', 'training', 'accelerat',
  'cuda', 'tensor', 'infiniband', 'efa', 'nccl', 'sagemaker hyperpod',
  'capacity block', 'gpu instance', 'gpu cluster', 'ai infrastructure',
];

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
          .filter(item =>
            feed.alwaysInclude ||
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
            date: item.pubDate || item.isoDate || item.updated,
            snippet: extractSnippet(item),
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

// Topic keyword sets for page-specific filtering
const TOPIC_KEYWORDS = {
  networking: [
    'vpc', 'vnet', 'load balancer', 'cdn', 'dns', 'vpn', 'firewall', 'nat',
    'egress', 'gateway', 'subnet', 'peering', 'transit', 'direct connect',
    'expressroute', 'interconnect', 'cloudfront', 'waf', 'ddos', 'routing',
    'private link', 'private endpoint', 'nsg', 'flow log',
    'kubernetes', 'eks', 'aks', 'gke', 'cluster', 'node pool', 'pod', 'helm',
    'istio', 'cilium', 'ebpf', 'cni', 'karpenter', 'autoscal', 'ingress',
    'service mesh', 'network policy', 'containerd', 'kubelet',
  ],
  ai: [
    'gpu', 'h100', 'h200', 'a100', 'b200', 'b300', 'blackwell', 'hopper',
    'nvidia', 'p4', 'p5', 'p6', 'inferenc', 'training', 'accelerat',
    'cuda', 'tensor', 'infiniband', 'efa', 'nccl', 'sagemaker', 'hyperpod',
    'capacity block', 'gpu instance', 'gpu cluster', 'ai infrastructure',
    'llm', 'foundation model', 'generative ai', 'machine learning',
    'deep learning', 'vertex ai', 'bedrock', 'openai',
  ],
};

Router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    const expired = !cache.lastFetched || now - cache.lastFetched > CACHE_TTL_MS;

    if (expired || !cache.data) {
      console.log('Refreshing news feed cache...');
      cache.data = await fetchAllFeeds();
      cache.lastFetched = now;
    }

    let items = cache.data;

    // Filter by topic if requested: ?topic=networking or ?topic=ai
    const { topic } = req.query;
    if (topic && TOPIC_KEYWORDS[topic]) {
      const kws = TOPIC_KEYWORDS[topic];
      items = items.filter(i =>
        kws.some(kw => (i.title || '').toLowerCase().includes(kw) ||
                        (i.snippet || '').toLowerCase().includes(kw) ||
                        (i.label || '').toLowerCase().includes(kw))
      );
    }

    res.json({ lastUpdated: new Date(cache.lastFetched).toISOString(), items });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = Router;
