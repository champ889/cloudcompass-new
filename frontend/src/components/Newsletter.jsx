import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      // Beehiiv embed form submission
      const res = await fetch('https://algorhythm-au.beehiiv.com/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="provider-card rounded-2xl p-10 shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Stay in the loop</h2>
          <p className="opacity-60 text-sm mb-8">
            Get the latest cloud networking and Kubernetes insights delivered to your inbox via our Algorhythm newsletter.
          </p>

          {status === 'success' ? (
            <div className="text-green-400 font-medium py-4">
              ✓ You're subscribed! Check your inbox to confirm.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="form-input flex-1 rounded-lg px-4 py-3 text-sm border"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                Subscribe →
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-red-400 text-xs mt-3">
              Something went wrong. <a href="https://algorhythm-au.beehiiv.com" target="_blank" rel="noopener noreferrer" className="underline">Subscribe directly →</a>
            </p>
          )}

          <p className="text-xs opacity-30 mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
