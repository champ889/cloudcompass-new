import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import NetworkingComparison from './components/NetworkingComparison';
import KubernetesComparison from './components/KubernetesComparison';
import CostCalculator from './components/CostCalculator';
import Newsletter from './components/Newsletter';
import CloudNews from './components/CloudNews';

function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4">
      <Hero />
      <CostCalculator />
      <NetworkingComparison />
      <KubernetesComparison />
      <Newsletter />
      <CloudNews />
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
