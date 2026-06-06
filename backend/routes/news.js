const express = require('express');
const Router = express.Router();
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 12000,
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

function extractSnippet(item, maxLength = 220) {
  const raw = item.contentSnippet || item.summary || item.content || '';
  const clean = stripHtml(raw);
  return clean.length > maxLength ? clean.slice(0, maxLength) + '…' : clean;
}

// ─────────────────────────────────────────────────────────────────────────────
// FEEDS — split by topic so each page only gets relevant articles
// topic: 'networking' | 'ai' | 'both'
// ─────────────────────────────────────────────────────────────────────────────
const FEEDS = [

  // ── AWS NETWORKING & K8S ─────────────────────────────────────────────────
  {
    provider: 'AWS', color: '#FF9900',
    url: 'https://aws.amazon.com/blogs/networking-and-content-delivery/feed/',
    label: 'AWS Networking Blog',
    topic: 'networking',
    alwaysInclude: true,
  },
  {
    provider: 'AWS', color: '#FF9900',
    url: 'https://aws.amazon.com/blogs/containers/feed/',
    label: 'AWS Containers Blog',
    topic: 'networking',
    alwaysInclude: true,
  },
  {
    provider: 'AWS', color: '#FF9900',
    url: 'https://github.com/awsdocs/amazon-eks-user-guide/commits/mainline/latest/ug/versioning/platform-versions.adoc.atom',
    label: 'EKS Platform Versions',
    topic: 'networking',
    alwaysInclude: true,
  },

  // ── AWS AI & GPU ──────────────────────────────────────────────────────────
  {
    provider: 'AWS', color: '#FF9900',
    url: 'https://aws.amazon.com/blogs/machine-learning/feed/',
    label: 'AWS Machine Learning Blog',
    topic: 'ai',
    alwaysInclude: false,
  },
  {
    provider: 'AWS', color: '#FF9900',
    url: 'https://aws.amazon.com/blogs/hpc/feed/',
    label: 'AWS HPC Blog',
    topic: 'ai',
    alwaysInclude: true,
  },
  {
    provider: 'AWS', color: '#FF9900',
    url: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/',
    label: "AWS What's New",
    topic: 'ai',
    alwaysInclude: false,
  },

  // ── AZURE NETWORKING & K8S ───────────────────────────────────────────────
  {
    provider: 'Azure', color: '#0078D4',
    url: 'https://techcommunity.microsoft.com/t5/s/gxcuf89792/rss/board?board.id=AzureNetworkingBlog',
    label: 'Azure Networking Blog',
    topic: 'networking',
    alwaysInclude: true,
  },
  {
    provider: 'Azure', color: '#0078D4',
    url: 'https://github.com/Azure/AKS/releases.atom',
    label: 'AKS Release Notes',
    topic: 'networking',
    alwaysInclude: true,
  },
  {
    provider: 'Azure', color: '#0078D4',
    url: 'https://techcommunity.microsoft.com/t5/s/gxcuf89792/rss/board?board.id=AzureInfrastructureBlog',
    label: 'Azure Infrastructure Blog',
    topic: 'networking',
    alwaysInclude: false,
  },

  // ── AZURE AI & GPU ────────────────────────────────────────────────────────
  {
    provider: 'Azure', color: '#0078D4',
    url: 'https://techcommunity.microsoft.com/t5/s/gxcuf89792/rss/board?board.id=AzureHighPerformanceComputingBlog',
    label: 'Azure HPC & GPU Blog',
    topic: 'ai',
    alwaysInclude: true,
  },
  {
    provider: 'Azure', color: '#0078D4',
    url: 'https://techcommunity.microsoft.com/t5/s/gxcuf89792/rss/board?board.id=AzureAIBlog',
    label: 'Azure AI Blog',
    topic: 'ai',
    alwaysInclude: false,
  },
  {
    provider: 'Azure', color: '#0078D4',
    url: 'https://www.microsoft.com/releasecommunications/api/v2/azure/rss',
    label: 'Azure Updates',
    topic: 'ai',
    alwaysInclude: false,
  },

  // ── GCP NETWORKING & K8S ─────────────────────────────────────────────────
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloudblog.withgoogle.com/products/networking/rss/',
    label: 'GCP Networking Blog',
    topic: 'networking',
    alwaysInclude: true,
  },
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloudblog.withgoogle.com/products/containers-kubernetes/rss/',
    label: 'GCP Kubernetes Blog',
    topic: 'networking',
    alwaysInclude: true,
  },
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/kubernetes-engine-release-notes.xml',
    label: 'GKE Release Notes',
    topic: 'networking',
    alwaysInclude: true,
  },
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/virtual-private-cloud-release-notes.xml',
    label: 'GCP VPC Release Notes',
    topic: 'networking',
    alwaysInclude: true,
  },
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/cloud-load-balancing-release-notes.xml',
    label: 'GCP Load Balancing',
    topic: 'networking',
    alwaysInclude: true,
  },

  // ── GCP AI & GPU ──────────────────────────────────────────────────────────
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloudblog.withgoogle.com/products/ai-machine-learning/rss/',
    label: 'GCP AI & ML Blog',
    topic: 'ai',
    alwaysInclude: false,
  },
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/compute-engine-release-notes.xml',
    label: 'GCP Compute (GPU) Notes',
    topic: 'ai',
    alwaysInclude: false,
  },
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloud.google.com/feeds/vertex-ai-release-notes.xml',
    label: 'Vertex AI Release Notes',
    topic: 'ai',
    alwaysInclude: false,
  },
  {
    provider: 'GCP', color: '#4285F4',
    url: 'https://cloudblog.withgoogle.com/products/infrastructure/rss/',
    label: 'GCP Infrastructure Blog',
    topic: 'ai',
    alwaysInclude: false,
  },
];

// Keywords for secondary filtering on non-alwaysInclude feeds
const NETWORKING_KEYWORDS = [
  // Networking services
  'vpc', 'vnet', 'virtual network', 'load balancer', 'cdn', 'dns', 'vpn',
  'firewall', 'nat gateway', 'subnet', 'peering', 'transit gateway',
  'direct connect', 'expressroute', 'interconnect', 'cloudfront',
  'waf', 'ddos', 'routing', 'private link', 'private endpoint',
  'nsg', 'flow log', 'network security', 'traffic manager',
  'azure front door', 'global accelerator', 'route 53',
  // Kubernetes
  'kubernetes', 'eks', 'aks', 'gke', 'cluster', 'node pool', 'pod',
  'helm', 'istio', 'cilium', 'ebpf', 'cni', 'karpenter', 'ingress',
  'service mesh', 'network policy', 'containerd', 'kubelet', 'kubeadm',
  'kubectl', 'control plane', 'node group', 'fargate', 'autopilot',
];

const AI_KEYWORDS = [
  // GPU hardware
  'gpu', 'h100', 'h200', 'a100', 'b200', 'b300', 'gb200', 'gb300',
  'blackwell', 'hopper', 'ampere', 'nvidia', 'p4d', 'p5', 'p6',
  'cuda', 'tensor core', 'nvlink', 'infiniband', 'efa',
  // GPU cloud / GPUaaS
  'gpu instance', 'gpu cluster', 'gpu cloud', 'gpu compute',
  'capacity block', 'hyperpod', 'sagemaker', 'vertex ai', 'bedrock',
  'supercompute', 'ai factory', 'ai infrastructure', 'ai accelerat',
  // Inference & training
  'inferenc', 'llm inference', 'model serving', 'vllm', 'tensorrt',
  'triton', 'model training', 'distributed training', 'fine-tun',
  'nccl', 'rdma', 'hpc', 'high performance computing',
  // AI workloads
  'large language model', 'llm', 'foundation model', 'generative ai',
  'deep learning', 'machine learning workload',
];

function matchesKeywords(item, keywords) {
  const text = ((item.title || '') + ' ' + (item.contentSnippet || '') + ' ' + (item.summary || '')).toLowerCase();
  return keywords.some(kw => text.includes(kw));
}

let cache = { data: null, lastFetched: null };
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

async function fetchAllFeeds() {
  const results = [];

  await Promise.allSettled(
    FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        const keywords = feed.topic === 'ai' ? AI_KEYWORDS : NETWORKING_KEYWORDS;
        const filtered = parsed.items
          .filter(item => feed.alwaysInclude || matchesKeywords(item, keywords))
          .slice(0, 6)
          .map(item => ({
            provider: feed.provider,
            color: feed.color,
            label: feed.label,
            topic: feed.topic,
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
    const { topic } = req.query;
    if (topic === 'networking') items = items.filter(i => i.topic === 'networking');
    else if (topic === 'ai') items = items.filter(i => i.topic === 'ai');

    res.json({ lastUpdated: new Date(cache.lastFetched).toISOString(), items });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = Router;

