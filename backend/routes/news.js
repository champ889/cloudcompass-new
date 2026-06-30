const express = require('express');
const Router = express.Router();
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 12000,
  customFields: { item: ['media:content', 'media:thumbnail', 'content', 'summary'] },
});

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function extractSnippet(item, maxLength) {
  if (!maxLength) maxLength = 220;
  const raw = item.contentSnippet || item.summary || item.content || '';
  const clean = stripHtml(raw);
  return clean.length > maxLength ? clean.slice(0, maxLength) + '...' : clean;
}

const FEEDS = [
  // AWS NETWORKING
  { provider: 'AWS', color: '#FF9900', topic: 'networking', alwaysInclude: true,
    url: 'https://aws.amazon.com/blogs/networking-and-content-delivery/feed/',
    label: 'AWS Networking Blog' },
  { provider: 'AWS', color: '#FF9900', topic: 'networking', alwaysInclude: true,
    url: 'https://aws.amazon.com/blogs/containers/feed/',
    label: 'AWS Containers Blog' },
  { provider: 'AWS', color: '#FF9900', topic: 'networking', alwaysInclude: true,
    url: 'https://github.com/awsdocs/amazon-eks-user-guide/commits/mainline/latest/ug/versioning/platform-versions.adoc.atom',
    label: 'EKS Platform Versions' },

  // AWS AI
  { provider: 'AWS', color: '#FF9900', topic: 'ai', alwaysInclude: false,
    url: 'https://aws.amazon.com/blogs/machine-learning/feed/',
    label: 'AWS Machine Learning Blog' },
  { provider: 'AWS', color: '#FF9900', topic: 'ai', alwaysInclude: true,
    url: 'https://aws.amazon.com/blogs/hpc/feed/',
    label: 'AWS HPC Blog' },
  { provider: 'AWS', color: '#FF9900', topic: 'ai', alwaysInclude: false,
    url: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/',
    label: "AWS What's New" },

  // AZURE NETWORKING
  { provider: 'Azure', color: '#0078D4', topic: 'networking', alwaysInclude: true,
    url: 'https://techcommunity.microsoft.com/t5/s/gxcuf89792/rss/board?board.id=AzureNetworkingBlog',
    label: 'Azure Networking Blog' },
  { provider: 'Azure', color: '#0078D4', topic: 'networking', alwaysInclude: true,
    url: 'https://github.com/Azure/AKS/releases.atom',
    label: 'AKS Release Notes' },
  { provider: 'Azure', color: '#0078D4', topic: 'networking', alwaysInclude: false,
    url: 'https://techcommunity.microsoft.com/t5/s/gxcuf89792/rss/board?board.id=AzureInfrastructureBlog',
    label: 'Azure Infrastructure Blog' },

  // AZURE AI
  { provider: 'Azure', color: '#0078D4', topic: 'ai', alwaysInclude: true,
    url: 'https://techcommunity.microsoft.com/t5/s/gxcuf89792/rss/board?board.id=AzureHighPerformanceComputingBlog',
    label: 'Azure HPC & GPU Blog' },
  { provider: 'Azure', color: '#0078D4', topic: 'ai', alwaysInclude: false,
    url: 'https://techcommunity.microsoft.com/t5/s/gxcuf89792/rss/board?board.id=AzureAIBlog',
    label: 'Azure AI Blog' },
  { provider: 'Azure', color: '#0078D4', topic: 'ai', alwaysInclude: false,
    url: 'https://www.microsoft.com/releasecommunications/api/v2/azure/rss',
    label: 'Azure Updates' },

  // GCP NETWORKING
  { provider: 'GCP', color: '#4285F4', topic: 'networking', alwaysInclude: true,
    url: 'https://cloudblog.withgoogle.com/products/networking/rss/',
    label: 'GCP Networking Blog' },
  { provider: 'GCP', color: '#4285F4', topic: 'networking', alwaysInclude: true,
    url: 'https://cloudblog.withgoogle.com/products/containers-kubernetes/rss/',
    label: 'GCP Kubernetes Blog' },
  { provider: 'GCP', color: '#4285F4', topic: 'networking', alwaysInclude: true,
    url: 'https://cloud.google.com/feeds/kubernetes-engine-release-notes.xml',
    label: 'GKE Release Notes' },
  { provider: 'GCP', color: '#4285F4', topic: 'networking', alwaysInclude: true,
    url: 'https://cloud.google.com/feeds/virtual-private-cloud-release-notes.xml',
    label: 'GCP VPC Release Notes' },
  { provider: 'GCP', color: '#4285F4', topic: 'networking', alwaysInclude: true,
    url: 'https://cloud.google.com/feeds/cloud-load-balancing-release-notes.xml',
    label: 'GCP Load Balancing' },

  // GCP AI
  { provider: 'GCP', color: '#4285F4', topic: 'ai', alwaysInclude: false,
    url: 'https://cloudblog.withgoogle.com/products/ai-machine-learning/rss/',
    label: 'GCP AI & ML Blog' },
  { provider: 'GCP', color: '#4285F4', topic: 'ai', alwaysInclude: false,
    url: 'https://cloud.google.com/feeds/compute-engine-release-notes.xml',
    label: 'GCP Compute (GPU) Notes' },
  { provider: 'GCP', color: '#4285F4', topic: 'ai', alwaysInclude: false,
    url: 'https://cloud.google.com/feeds/vertex-ai-release-notes.xml',
    label: 'Vertex AI Release Notes' },
  { provider: 'GCP', color: '#4285F4', topic: 'ai', alwaysInclude: false,
    url: 'https://cloudblog.withgoogle.com/products/infrastructure/rss/',
    label: 'GCP Infrastructure Blog' },

  // KUBERNETES — Official project feeds only
  { provider: 'Kubernetes', color: '#326CE5', topic: 'kubernetes', alwaysInclude: true,
    url: 'https://kubernetes.io/feed.xml',
    label: 'Kubernetes Official Blog' },
  { provider: 'Kubernetes', color: '#326CE5', topic: 'kubernetes', alwaysInclude: true,
    url: 'https://github.com/kubernetes/kubernetes/releases.atom',
    label: 'Kubernetes Releases' },

  // CNCF
  { provider: 'CNCF', color: '#446CA9', topic: 'kubernetes', alwaysInclude: true,
    url: 'https://www.cncf.io/feed/',
    label: 'CNCF Blog' },

  // ISTIO — Service mesh
  { provider: 'Istio', color: '#466BB0', topic: 'kubernetes', alwaysInclude: true,
    url: 'https://istio.io/blog/index.xml',
    label: 'Istio Blog' },
  { provider: 'Istio', color: '#466BB0', topic: 'kubernetes', alwaysInclude: true,
    url: 'https://github.com/istio/istio/releases.atom',
    label: 'Istio Releases' },

  // CILIUM — eBPF networking & service mesh
  { provider: 'Cilium', color: '#F8C517', topic: 'kubernetes', alwaysInclude: true,
    url: 'https://cilium.io/blog/rss.xml',
    label: 'Cilium Blog' },
  { provider: 'Cilium', color: '#F8C517', topic: 'kubernetes', alwaysInclude: true,
    url: 'https://github.com/cilium/cilium/releases.atom',
    label: 'Cilium Releases' },

  // HELM — Package manager
  { provider: 'Helm', color: '#0F1689', topic: 'kubernetes', alwaysInclude: true,
    url: 'https://helm.sh/blog/index.xml',
    label: 'Helm Blog' },
  { provider: 'Helm', color: '#0F1689', topic: 'kubernetes', alwaysInclude: true,
    url: 'https://github.com/helm/helm/releases.atom',
    label: 'Helm Releases' },

  // ARGO CD — GitOps
  { provider: 'Argo', color: '#EF7B4D', topic: 'kubernetes', alwaysInclude: true,
    url: 'https://blog.argoproj.io/feed',
    label: 'Argo Blog' },
  { provider: 'Argo', color: '#EF7B4D', topic: 'kubernetes', alwaysInclude: true,
    url: 'https://github.com/argoproj/argo-cd/releases.atom',
    label: 'Argo CD Releases' },

  // FLUX — GitOps
  { provider: 'Flux', color: '#5468FF', topic: 'kubernetes', alwaysInclude: true,
    url: 'https://fluxcd.io/blog/index.xml',
    label: 'Flux Blog' },
  { provider: 'Flux', color: '#5468FF', topic: 'kubernetes', alwaysInclude: true,
    url: 'https://github.com/fluxcd/flux2/releases.atom',
    label: 'Flux Releases' },

  // GATEWAY API — Official Kubernetes networking
  { provider: 'Gateway API', color: '#326CE5', topic: 'kubernetes', alwaysInclude: true,
    url: 'https://github.com/kubernetes-sigs/gateway-api/releases.atom',
    label: 'Gateway API Releases' },

  // KARPENTER — Node autoscaler
  { provider: 'Karpenter', color: '#FF9900', topic: 'kubernetes', alwaysInclude: true,
    url: 'https://github.com/aws/karpenter-provider-aws/releases.atom',
    label: 'Karpenter Releases' },

  // FINOPS FOUNDATION — Official
  { provider: 'FinOps Foundation', color: '#0095DA', topic: 'finops', alwaysInclude: true,
    url: 'https://www.finops.org/feed/',
    label: 'FinOps Foundation Insights' },

  // FOCUS SPEC — open billing standard blog
  { provider: 'FOCUS', color: '#0095DA', topic: 'finops', alwaysInclude: true,
    url: 'https://focus.finops.org/feed/',
    label: 'FOCUS Spec Blog' },

  // FOCUS GitHub releases
  { provider: 'FOCUS', color: '#0095DA', topic: 'finops', alwaysInclude: true,
    url: 'https://github.com/FinOps-Open-Cost-and-Usage-Spec/FOCUS_Spec/releases.atom',
    label: 'FOCUS Specification Releases' },

  // AWS CLOUD FINANCIAL MANAGEMENT
  { provider: 'AWS FinOps', color: '#FF9900', topic: 'finops', alwaysInclude: true,
    url: 'https://aws.amazon.com/blogs/aws-cloud-financial-management/feed/',
    label: 'AWS Cloud Financial Management' },

  // AWS BEDROCK — AI cost management
  { provider: 'AWS FinOps', color: '#FF9900', topic: 'finops', alwaysInclude: false,
    url: 'https://aws.amazon.com/blogs/machine-learning/feed/',
    label: 'AWS ML Blog (AI Cost)' },

  // AWS WHAT'S NEW filtered for FinOps
  { provider: 'AWS FinOps', color: '#FF9900', topic: 'finops', alwaysInclude: false,
    url: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/',
    label: "AWS What's New (FinOps)" },

  // AZURE FINOPS BLOG
  { provider: 'Azure FinOps', color: '#0078D4', topic: 'finops', alwaysInclude: true,
    url: 'https://techcommunity.microsoft.com/t5/s/gxcuf89792/rss/board?board.id=FinOpsBlog',
    label: 'Azure FinOps Blog' },

  // AZURE COST MANAGEMENT
  { provider: 'Azure FinOps', color: '#0078D4', topic: 'finops', alwaysInclude: false,
    url: 'https://techcommunity.microsoft.com/t5/s/gxcuf89792/rss/board?board.id=AzureCostManagementBlog',
    label: 'Azure Cost Management Blog' },

  // GCP COST MANAGEMENT
  { provider: 'GCP FinOps', color: '#4285F4', topic: 'finops', alwaysInclude: false,
    url: 'https://cloudblog.withgoogle.com/products/cost-management/rss/',
    label: 'GCP Cost Management Blog' },

  // AUSTRALIAN CLOUD INDUSTRY
  { provider: 'iTnews', color: '#E4002B', topic: 'australia', alwaysInclude: false,
    url: 'https://www.itnews.com.au/RSS/rss.ashx',
    label: 'iTnews Australia' },
  { provider: 'CRN Australia', color: '#003366', topic: 'australia', alwaysInclude: false,
    url: 'https://www.crn.com.au/rss/rss.ashx',
    label: 'CRN Australia' },
  { provider: 'Computerworld AU', color: '#0073C6', topic: 'australia', alwaysInclude: false,
    url: 'https://www.computerworld.com/au/feed/',
    label: 'Computerworld Australia' },
];

const AUSTRALIA_KEYWORDS = [
  'australia', 'australian', 'sydney', 'melbourne', 'canberra', 'perth',
  'brisbane', 'adelaide', 'tasmania', 'queensland', 'nsw', 'victoria',
  'nextdc', 'aussie', 'apac', 'asia-pacific', 'asia pacific', 'anz',
  'sovereign cloud', 'data sovereignty', 'data residency',
  'digital transformation agency', 'dta ', 'australian government',
  'apra', 'asd', 'essential eight', 'irap', 'protected cloud',
  'australian computer society', 'acs ', 'iot australia',
  'firmus', 'sharon ai', 'micron21', 'iren', 'macquarie cloud',
  'aws sydney', 'azure australia', 'google cloud australia',
  'australia east', 'ap-southeast-2', 'australia-southeast',
];

const NETWORKING_KEYWORDS = [
  'vpc', 'vnet', 'virtual network', 'load balancer', 'cdn', 'dns', 'vpn',
  'firewall', 'nat gateway', 'subnet', 'peering', 'transit gateway',
  'direct connect', 'expressroute', 'interconnect', 'cloudfront',
  'waf', 'ddos', 'routing', 'private link', 'private endpoint',
  'nsg', 'flow log', 'network security', 'traffic manager',
  'azure front door', 'global accelerator', 'route 53',
  'kubernetes', 'eks', 'aks', 'gke', 'cluster', 'node pool', 'pod',
  'helm', 'istio', 'cilium', 'ebpf', 'cni', 'karpenter', 'ingress',
  'service mesh', 'network policy', 'containerd', 'kubelet', 'kubeadm',
  'kubectl', 'control plane', 'node group', 'fargate', 'autopilot',
];

const AI_KEYWORDS = [
  'gpu', 'h100', 'h200', 'a100', 'b200', 'b300', 'gb200', 'gb300',
  'blackwell', 'hopper', 'ampere', 'nvidia', 'p4d', 'p5', 'p6',
  'cuda', 'tensor core', 'nvlink', 'infiniband', 'efa',
  'gpu instance', 'gpu cluster', 'gpu cloud', 'gpu compute',
  'capacity block', 'hyperpod', 'sagemaker', 'vertex ai', 'bedrock',
  'supercompute', 'ai factory', 'ai infrastructure', 'ai accelerat',
  'inferenc', 'llm inference', 'model serving', 'vllm', 'tensorrt',
  'triton', 'model training', 'distributed training', 'fine-tun',
  'nccl', 'rdma', 'hpc', 'high performance computing',
  'large language model', 'llm', 'foundation model', 'generative ai',
  'deep learning', 'machine learning workload',
];

const KUBERNETES_KEYWORDS = [
  'kubernetes', 'k8s', 'kubectl', 'kubeadm', 'kubelet', 'kube-proxy',
  'pod', 'deployment', 'statefulset', 'daemonset', 'replicaset',
  'namespace', 'helm', 'operator', 'custom resource', 'crd',
  'cluster', 'node pool', 'control plane', 'etcd', 'api server',
  'ingress', 'service mesh', 'istio', 'linkerd', 'cilium', 'ebpf',
  'cni', 'csi', 'karpenter', 'cluster autoscaler', 'hpa', 'vpa',
  'argo', 'flux', 'gitops', 'tekton', 'knative', 'envoy', 'prometheus',
  'opentelemetry', 'observability', 'service account', 'rbac',
  'network policy', 'gateway api', 'containerd', 'cri-o',
  'cloud native', 'cncf', 'kubecon', 'multi-cluster', 'federation',
  'eks', 'aks', 'gke', 'k3s', 'k0s', 'rancher', 'openshift',
];

const FINOPS_KEYWORDS = [
  // Core FinOps
  'finops', 'fin ops', 'cloud cost', 'cost optimization', 'cost management',
  'cloud financial', 'cloud spend', 'cloud savings', 'reserved instance',
  'savings plan', 'spot instance', 'rightsizing', 'right-sizing',
  'cost allocation', 'cost governance', 'cloud budget', 'cost anomaly',
  'unit economics', 'chargeback', 'showback', 'tagging strategy',
  'cost explorer', 'cost and usage', 'cur ', 'billing',
  'cloud economics', 'waste elimination', 'idle resource', 'commitment',
  'discount', 'graviton', 'arm instance', 'cost visibility',
  'finops foundation', 'finops x', 'state of finops',
  'cost efficiency', 'cloud roi', 'cloud value', 'cost forecast',
  'cost anomaly detection', 'savings plans coverage',
  // FOCUS spec
  'focus spec', 'focus 1.', 'finops open cost', 'cost and usage specification',
  'billing dataset', 'cost schema', 'billing standard', 'finops toolkit',
  // AI FinOps
  'finops for ai', 'ai cost', 'ai spend', 'ai finops',
  'token economics', 'tokenomics', 'tokenomicon',
  'finops agent', 'ai cost management', 'ai cost optimization',
  'bedrock cost', 'vertex ai cost', 'llm cost', 'inference cost',
  'gpu cost', 'ai billing', 'model cost', 'ai budget',
  'token usage', 'token spend', 'ai financial', 'ai value',
  'cost per token', 'cost per inference', 'ai roi',
];

function getKeywords(topic) {
  if (topic === 'ai') return AI_KEYWORDS;
  if (topic === 'kubernetes') return KUBERNETES_KEYWORDS;
  if (topic === 'finops') return FINOPS_KEYWORDS;
  if (topic === 'australia') return AUSTRALIA_KEYWORDS;
  return NETWORKING_KEYWORDS;
}

function matchesKeywords(item, keywords) {
  const text = [item.title, item.contentSnippet, item.summary].join(' ').toLowerCase();
  return keywords.some(function(kw) { return text.indexOf(kw) !== -1; });
}

var cache = { data: null, lastFetched: null };
var CACHE_TTL_MS = 6 * 60 * 60 * 1000;

async function fetchAllFeeds() {
  var results = [];
  await Promise.allSettled(
    FEEDS.map(async function(feed) {
      try {
        var parsed = await parser.parseURL(feed.url);
        var keywords = getKeywords(feed.topic);
        var filtered = parsed.items
          .filter(function(item) {
            return feed.alwaysInclude || matchesKeywords(item, keywords);
          })
          .slice(0, 6)
          .map(function(item) {
            return {
              provider: feed.provider,
              color: feed.color,
              label: feed.label,
              topic: feed.topic,
              title: (item.title || '').trim(),
              link: item.link,
              date: item.pubDate || item.isoDate || item.updated,
              snippet: extractSnippet(item),
            };
          });
        results = results.concat(filtered);
      } catch (err) {
        console.error('Failed to fetch ' + feed.url + ': ' + err.message);
      }
    })
  );
  return results
    .filter(function(i) { return i.title && i.link; })
    .sort(function(a, b) { return new Date(b.date || 0) - new Date(a.date || 0); });
}

Router.get('/', async function(req, res) {
  try {
    var now = Date.now();
    var expired = !cache.lastFetched || now - cache.lastFetched > CACHE_TTL_MS;
    if (expired || !cache.data) {
      console.log('Refreshing news feed cache...');
      cache.data = await fetchAllFeeds();
      cache.lastFetched = now;
    }
    var items = cache.data;
    var topic = req.query.topic;
    if (topic === 'networking') items = items.filter(function(i) { return i.topic === 'networking'; });
    else if (topic === 'ai') items = items.filter(function(i) { return i.topic === 'ai'; });
    else if (topic === 'kubernetes') items = items.filter(function(i) { return i.topic === 'kubernetes'; });
    else if (topic === 'finops') items = items.filter(function(i) { return i.topic === 'finops'; });
    else if (topic === 'australia') items = items.filter(function(i) { return i.topic === 'australia'; });
    res.json({ lastUpdated: new Date(cache.lastFetched).toISOString(), items: items });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = Router;
