import React from 'react';

const Footer = () => {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer className="py-12" style={{ backgroundColor: 'var(--card-background)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">CloudCompass</h3>
            <p className="text-sm opacity-60">Helping Australian businesses navigate cloud networking and Kubernetes decisions across AWS, Azure, and GCP.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 footer-links text-sm">
              <li><a href="#networking" onClick={(e) => { e.preventDefault(); scrollTo('networking'); }}>Networking</a></li>
              <li><a href="#kubernetes" onClick={(e) => { e.preventDefault(); scrollTo('kubernetes'); }}>Kubernetes</a></li>
              <li><a href="#calculator" onClick={(e) => { e.preventDefault(); scrollTo('calculator'); }}>Cost Calculator</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm opacity-60">
              <li>Email: <a href="mailto:info@cloudcompass.com.au" className="hover:opacity-100">info@cloudcompass.com.au</a></li>
              <li>Phone: +61 2 1234 5678</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Disclaimer</h3>
            <p className="text-xs opacity-40">Pricing shown is approximate and based on public cloud pricing pages. Always verify with the official provider. Rates change frequently.</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-xs opacity-30">
          © {new Date().getFullYear()} CloudCompass. Focused on AWS · Azure · Google Cloud.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
