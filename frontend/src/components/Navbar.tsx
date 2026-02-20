import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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
          </div>
        </div>
      )}
    </>
  );
}
