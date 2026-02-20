import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <Layout>
      <section className="notfound">
        <div className="notfound-content animate-in">
          <span className="notfound-code">404</span>
          <h1 className="notfound-title">Page not found</h1>
          <p className="notfound-text">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="notfound-cta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Home
          </Link>
        </div>
      </section>
    </Layout>
  );
}
