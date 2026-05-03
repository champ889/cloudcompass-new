import React from 'react';

const Hero = () => {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="home" className="mt-20 pt-20 pb-40 px-4 bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">CloudCompass</h1>
        <p className="text-xl mb-4 max-w-3xl mx-auto">
          Side-by-side networking and Kubernetes comparisons across AWS, Azure, and Google Cloud — with a live cost calculator.
        </p>
        <p className="text-blue-200 mb-10 text-sm">Focused on the three major hyperscalers. No noise, just decisions.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={() => scrollTo('networking')} className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors">
            Networking →
          </button>
          <button onClick={() => scrollTo('kubernetes')} className="border border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors">
            Kubernetes →
          </button>
          <button onClick={() => scrollTo('calculator')} className="border border-blue-300 text-blue-200 px-8 py-3 rounded-full font-semibold hover:bg-blue-800 transition-colors">
            Cost Calculator →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
