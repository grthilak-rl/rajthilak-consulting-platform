import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          raj<span>thilak</span>
        </div>
        <ul className="footer-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/portfolio">Portfolio</Link></li>
          <li><Link to="/submit">Submit Requirement</Link></li>
          <li><Link to="/admin/dashboard">Admin</Link></li>
        </ul>
        <div className="footer-copy">2026 Raj Thilak. All rights reserved.</div>
      </div>
    </footer>
  );
}
