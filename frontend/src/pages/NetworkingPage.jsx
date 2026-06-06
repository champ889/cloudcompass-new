import React from 'react';
import NetworkingComparison from '../components/NetworkingComparison';
import KubernetesComparison from '../components/KubernetesComparison';
import CostCalculator from '../components/CostCalculator';
import Newsletter from '../components/Newsletter';
import CloudNews from '../components/CloudNews';

const NetworkingPage = () => (
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
    <CloudNews topic="networking" title="Networking & K8s Updates" />
    <Newsletter />

  </main>
);

export default NetworkingPage;
