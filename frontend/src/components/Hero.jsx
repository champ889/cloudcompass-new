import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => (
  <section id="home" className="mt-16 pt-16 pb-20 px-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}>
    <div className="max-w-5xl mx-auto">

      <div className="flex justify-center mb-6">
        <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500 text-blue-400">
          For FinOps Engineers, Solution Architects & Medium Enterprises
        </span>
      </div>

      <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-4 leading-tight">
        Cloud decisions,<br className="hidden md:block" /> not cloud confusion.
      </h1>
      <p className="text-center text-blue-200 text-base md:text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
        Side-by-side specs, pricing, and calculators for networking, Kubernetes, and AI GPU infrastructure — across AWS, Azure, GCP, and Australian sovereign cloud.
      </p>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

        <Link
          to="/networking"
          className="group rounded-xl p-6 text-left border border-blue-800 hover:border-blue-400 transition-all no-underline"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div className="text-3xl mb-3">🌐</div>
          <p className="font-bold text-white text-lg mb-2">Networking & Kubernetes</p>
          <p className="text-sm text-blue-300 opacity-80 mb-4 leading-relaxed">
            VPC, Load Balancing, CDN, DNS, VPN — plus EKS vs AKS vs GKE with a live cost calculator. Includes the latest networking and K8s news feed.
          </p>
          <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold group-hover:gap-3 transition-all">
            Explore <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>

        <Link
          to="/ai-cloud"
          className="group rounded-xl p-6 text-left border border-purple-800 hover:border-purple-400 transition-all no-underline"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div className="text-3xl mb-3">⚡</div>
          <p className="font-bold text-white text-lg mb-2">AI Cloud & GPU Pricing</p>
          <p className="text-sm text-blue-300 opacity-80 mb-4 leading-relaxed">
            CoreWeave, Lambda, RunPod, Nebius — plus Australian sovereign cloud (Sharon AI, Firmus, Micron21, IREN). GPU pricing calculator and AI news feed.
          </p>
          <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold group-hover:gap-3 transition-all">
            Explore <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>
      </div>

      {/* Quick stats bar */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-blue-900 pt-10">
        {[
          { label: 'Providers compared', value: '12+' },
          { label: 'GPU types tracked', value: 'A100 · H100 · H200' },
          { label: 'AU sovereign options', value: '5' },
          { label: 'News feed refresh', value: 'Every 6hrs' },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <p className="text-white font-bold text-sm">{s.value}</p>
            <p className="text-blue-400 text-xs opacity-60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

    </div>
  </section>
);

export default Hero;
