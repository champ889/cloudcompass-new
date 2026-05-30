import React from 'react';

const Hero = () => {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="home" className="mt-20 pt-16 pb-20 px-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Audience tag */}
        <div className="flex justify-center mb-6">
          <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500 text-blue-400">
            For FinOps Engineers, Solution Architects & Medium Enterprises
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-4 leading-tight">
          Cloud decisions,<br className="hidden md:block" /> not cloud confusion.
        </h1>
        <p className="text-center text-blue-200 text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Side-by-side specs, pricing, and calculators for networking, Kubernetes, and AI GPU infrastructure — across AWS, Azure, GCP, and Australian sovereign cloud.
        </p>

        {/* Three pillars CTA */}
        <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <button
            onClick={() => scrollTo('networking')}
            className="group rounded-xl p-5 text-left border border-blue-800 hover:border-blue-400 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div className="text-2xl mb-2">🌐</div>
            <p className="font-semibold text-white text-sm mb-1">Networking & K8s</p>
            <p className="text-xs text-blue-300 opacity-70">VPC, LB, CDN, DNS, EKS vs AKS vs GKE — with cost calculator</p>
            <p className="text-xs text-blue-400 mt-3 group-hover:translate-x-1 transition-transform">Explore →</p>
          </button>

          <button
            onClick={() => scrollTo('aicloud')}
            className="group rounded-xl p-5 text-left border border-blue-800 hover:border-blue-400 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div className="text-2xl mb-2">⚡</div>
            <p className="font-semibold text-white text-sm mb-1">AI Cloud & GPUaaS</p>
            <p className="text-xs text-blue-300 opacity-70">CoreWeave, Lambda, RunPod, Nebius — GPU pricing & inference</p>
            <p className="text-xs text-blue-400 mt-3 group-hover:translate-x-1 transition-transform">Explore →</p>
          </button>

          <button
            onClick={() => scrollTo('auaicloud')}
            className="group rounded-xl p-5 text-left border border-green-800 hover:border-green-400 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div className="text-2xl mb-2">🇦🇺</div>
            <p className="font-semibold text-white text-sm mb-1">Australia AI Cloud</p>
            <p className="text-xs text-blue-300 opacity-70">Sharon AI, Firmus — sovereign GPU pricing for AU workloads</p>
            <p className="text-xs text-green-400 mt-3 group-hover:translate-x-1 transition-transform">Explore →</p>
          </button>
        </div>

      </div>
    </section>
  );
};

export default Hero;
