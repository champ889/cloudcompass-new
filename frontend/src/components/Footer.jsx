import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="py-12 mt-8" style={{ backgroundColor: 'var(--card-background)' }}>
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-3">CloudCompass</h3>
          <p className="text-sm opacity-60 leading-relaxed">
            Helping FinOps engineers, solution architects, and medium enterprises navigate cloud networking, Kubernetes, and AI GPU decisions across AWS, Azure, GCP, and Australian sovereign cloud.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Pages</h3>
          <ul className="space-y-2 text-sm footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/networking">Networking & Kubernetes</Link></li>
            <li><Link to="/ai-cloud">AI Cloud & GPU Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm opacity-60">
            <li>Email: <a href="mailto:info@cloudcompass.com.au" className="hover:opacity-100">info@cloudcompass.com.au</a></li>
            <li>Newsletter: <a href="https://algorhythm-au.beehiiv.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-100">Algorhythm AU</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Disclaimer</h3>
          <p className="text-xs opacity-40 leading-relaxed">
            Pricing shown is approximate based on public cloud pricing pages. Always verify with the official provider. Rates change frequently. Not financial advice.
          </p>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-gray-700 text-center text-xs opacity-30">
        © {new Date().getFullYear()} CloudCompass · AWS · Azure · Google Cloud · Australian Sovereign Cloud
      </div>
    </div>
  </footer>
);

export default Footer;
