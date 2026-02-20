import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import './Navbar.css';

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!transparent) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navClass = transparent
    ? `nav ${scrolled ? 'solid' : 'transparent'}`
    : 'nav scrolled';

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className={navClass}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            raj<span>thilak</span>
          </Link>
          <ul className="nav-links">
            <li>
              <Link to="/" className={isActive('/') ? 'active' : ''}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/portfolio" className={isActive('/portfolio') ? 'active' : ''}>
                Portfolio
              </Link>
            </li>
            <li>
              <Link to="/about" className={isActive('/about') ? 'active' : ''}>
                About
              </Link>
            </li>
            <li>
              <Link to="/submit" className="nav-cta">
                Submit Requirement
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </li>
          </ul>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>
          <button
            className="nav-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div
            className="mobile-menu-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="mobile-menu-panel">
            <button
              className="mobile-menu-close"
              onClick={() => setMobileMenuOpen(false)}
            >
              &times;
            </button>
            <ul className="mobile-menu-links">
              <li><Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link></li>
              <li><Link to="/portfolio" className={isActive('/portfolio') ? 'active' : ''}>Portfolio</Link></li>
              <li><Link to="/about" className={isActive('/about') ? 'active' : ''}>About</Link></li>
              <li><Link to="/submit">Submit Requirement</Link></li>
            </ul>
            <button className="mobile-theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
