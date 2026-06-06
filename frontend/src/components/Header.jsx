import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useMediaQuery from './useMediaQuery';

const NAV = [
  { label: 'Home',              to: '/' },
  { label: 'Networking & K8s',  to: '/networking' },
  { label: 'AI Cloud',          to: '/ai-cloud' },
];

const Header = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

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

  const isActive = (to) => location.pathname === to;

  const navLinks = (
    <>
      {NAV.map(item => (
        <Link
          key={item.to}
          to={item.to}
          className={`nav-link ${isActive(item.to) ? 'nav-link-active' : ''}`}
          style={isActive(item.to) ? { color: 'var(--primary-color)', borderBottom: '2px solid var(--primary-color)', paddingBottom: '2px' } : {}}
        >
          {item.label}
        </Link>
      ))}
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
            <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-blue-400 no-underline">
              CloudCompass
            </Link>
            <div className="w-8" />
            <button
              className="hamburger-menu text-2xl p-2 focus:outline-none z-50 ml-auto"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        ) : (
          <nav
            id="navbar"
            className={`fixed top-0 left-0 w-full shadow-lg transition-transform duration-300 z-40 backdrop-blur-sm ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'}`}
          >
            <div className="mx-auto px-6 lg:px-8 w-full">
              <div className="flex items-center h-16">
                <Link to="/" className="text-lg font-bold text-blue-400 no-underline flex-shrink-0 mr-8">
                  CloudCompass
                  <span className="text-xs opacity-40 ml-2 hidden lg:inline">for FinOps, Solution Architects & Medium Enterprises</span>
                </Link>
                <div className="flex items-center space-x-6 flex-1">{navLinks}</div>
                <div className="flex-shrink-0"><ThemeToggle /></div>
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
