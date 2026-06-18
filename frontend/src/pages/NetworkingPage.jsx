import React, { useState } from 'react';
import NetworkingComparison from '../components/NetworkingComparison';
import KubernetesComparison from '../components/KubernetesComparison';
import CostCalculator from '../components/CostCalculator';
import Newsletter from '../components/Newsletter';
import CloudNews from '../components/CloudNews';

const NEWS_TABS = [
  { key: 'networking', label: '🌐 Networking News' },
  { key: 'kubernetes', label: '☸️ Kubernetes News' },
];

const NetworkingPage = () => {
  const [newsTab, setNewsTab] = useState('networking');

  return (
    <main className="max-w-7xl mx-auto px-4 mt-20">

      <div className="py-10 border-b border-gray-700 mb-4">
        <h1 className="text-3xl font-bold mb-2">Networking & Kubernetes</h1>
        <p className="opacity-60 text-sm max-w-2xl">
          Side-by-side comparison of AWS, Azure, and GCP networking services and managed Kubernetes — with a live cost calculator.
        </p>
      </div>

      <NetworkingComparison />
      <KubernetesComparison />
      <CostCalculator />

      {/* News section with tab switcher */}
      <div className="mt-8 border-t border-gray-700 pt-8">
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {NEWS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setNewsTab(tab.key)}
              className={`service-pill ${newsTab === tab.key ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {newsTab === 'networking' && (
          <CloudNews
            topic="networking"
            title="Networking Updates"
          />
        )}
        {newsTab === 'kubernetes' && (
          <CloudNews
            topic="kubernetes"
            title="Kubernetes & Cloud Native News"
          />
        )}
      </div>

      <Newsletter />
    </main>
  );
};

export default NetworkingPage;
