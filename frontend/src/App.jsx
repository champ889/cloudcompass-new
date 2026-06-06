import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import NetworkingPage from './pages/NetworkingPage';
import AICloudPage from './pages/AICloudPage';

function App() {
  return (
    <BrowserRouter>
      <div id="app">
        <Header />
        <Routes>
          <Route path="/"            element={<HomePage />} />
          <Route path="/networking"  element={<NetworkingPage />} />
          <Route path="/ai-cloud"    element={<AICloudPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
