import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import NetworkingComparison from './components/NetworkingComparison';
import KubernetesComparison from './components/KubernetesComparison';
import CostCalculator from './components/CostCalculator';
import Newsletter from './components/Newsletter';

function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4">
      <Hero />
      <NetworkingComparison />
      <KubernetesComparison />
      <CostCalculator />
      <Newsletter />
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div id="app">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
