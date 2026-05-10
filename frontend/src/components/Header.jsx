import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useMediaQuery from './useMediaQuery';

const Header = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      if (isMobile) return;
      const currentScrollY = window.scrollY;
      setIsNavbarVisible(currentScrollY <= lastScrollY.current || currentScrollY <= 100);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  useEffect(() => {
    document.body.style.overflow = isMobile && isMobileMenuOpen ? 'hidden' : 'unset';
  }, [isMobile, isMobileMenuOpen]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const navLinks = (
    <>
      <a href="#home" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('home'); }}>Home</a>
      <a href="#news" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('news'); }}>News</a>
      <a href="#networking" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('networking'); }}>Networking</a>
      <a href="#kubernetes" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('kubernetes'); }}>Kubernetes</a>
      <a href="#calculator" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('calculator'); }}>Calculator</a>
    </>
  );

  const ThemeToggle = () => (
    <div className="theme-switch flex items-center">
      <span className="text-yellow-500 mr-2">🌞</span>
      <label className="switch">
        <input type="checkbox" onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')} checked={theme === 'dark'} />
        <span className="slider"></span>
      </label>
      <span className="text-blue-500 ml-2">🌙</span>
    </div>
  );

  return (
    <>
      <div className="relative">
        {isMobile ? (
          <div className="flex justify-between items-center h-16 px-4 relative z-50">
            <div className="w-8" />
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <span className="text-xl font-bold text-blue-400">CloudCompass</span>
            </div>
            <button
              className="hamburger-menu text-2xl p-2 focus:outline-none z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        ) : (
          <nav
            id="navbar"
            className={`fixed top-0 left-0 w-full shadow-lg transition-transform duration-300 z-40 bg-opacity-95 backdrop-blur-sm ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'}`}
          >
            <div className="mx-auto px-6 lg:px-8 w-full">
              <div className="flex items-center h-20">
                <div className="flex-1 flex justify-start">
                  <span className="text-xl font-bold text-blue-400">CloudCompass</span>
                </div>
                <div className="hidden md:flex items-center space-x-8">{navLinks}</div>
                <div className="flex-1 flex justify-end"><ThemeToggle /></div>
              </div>
            </div>
          </nav>
        )}
      </div>

      {isMobile && isMobileMenuOpen && (
        <div className="mobile-menu fixed inset-0 z-40 bg-black bg-opacity-95 pt-24 pb-8 px-6 flex flex-col h-screen">
          <div className="flex flex-col items-center space-y-8 text-xl w-full">{navLinks}</div>
          <div className="mt-auto flex flex-col items-center gap-6 w-full border-t border-gray-800 pt-8">
            <ThemeToggle />
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white text-sm uppercase tracking-widest">
              Close Menu
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
