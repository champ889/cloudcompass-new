import React from 'react';
import AICloud from '../components/AICloud';
import AUAICloud from '../components/AUAICloud';
import AUGPUPricing from '../components/AUGPUPricing';
import Newsletter from '../components/Newsletter';
import CloudNews from '../components/CloudNews';

const AICloudPage = () => (
  <main className="max-w-7xl mx-auto px-4 mt-20">

    <div className="py-10 border-b border-gray-700 mb-4">
      <h1 className="text-3xl font-bold mb-2">AI Cloud & GPU Pricing</h1>
      <p className="opacity-60 text-sm max-w-2xl">
        Global AI neoclouds and Australian sovereign GPU providers — with pricing comparison tables, calculators, and an AI-focused news feed.
      </p>
    </div>

    {/* Global AI neoclouds — CoreWeave, Lambda, RunPod, Nebius */}
    <AICloud />

    {/* Australian sovereign AI cloud — Sharon AI, Firmus, Micron21, IREN, SCX.ai */}
    <AUAICloud />

    {/* Full GPU pricing table — all providers accessible from AU */}
    <section className="py-10">
      <AUGPUPricing />
    </section>

    <CloudNews topic="ai" title="AI & GPU Updates" />
    <Newsletter />

  </main>
);

export default AICloudPage;
