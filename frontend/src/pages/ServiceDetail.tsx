import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchService, fetchServices } from '../api/client';
import type { Service } from '../types';
import Skeleton from '../components/Skeleton';
import './ServiceDetail.css';

const getServiceIcon = (icon: string) => {
  switch (icon) {
    case 'briefcase':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      );
    case 'edit':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      );
    case 'clock':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      );
    default:
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      );
  }
};

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [otherServices, setOtherServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      setError(false);
      try {
        const [svc, allServices] = await Promise.all([
          fetchService(slug),
          fetchServices().catch(() => []),
        ]);
        setService(svc);
        setOtherServices(allServices.filter(s => s.slug !== slug));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        {/* Breadcrumb skeleton */}
        <div className="svc-breadcrumb">
          <Skeleton width={40} height={13} style={{ display: 'inline-block' }} />
          <span className="breadcrumb-sep">/</span>
          <Skeleton width={60} height={13} style={{ display: 'inline-block' }} />
          <span className="breadcrumb-sep">/</span>
          <Skeleton width={120} height={13} style={{ display: 'inline-block' }} />
        </div>

        {/* Hero skeleton (centered layout) */}
        <section className="svc-detail-hero">
          <div className="svc-detail-hero-inner">
            <Skeleton width={72} height={72} variant="rounded" style={{ margin: '0 auto 24px' }} />
            <Skeleton width="50%" height={36} style={{ margin: '0 auto' }} />
            <Skeleton width="80%" height={16} style={{ margin: '20px auto 0' }} />
            <Skeleton width="80%" height={16} style={{ margin: '8px auto 0' }} />
            <Skeleton width="60%" height={16} style={{ margin: '8px auto 0' }} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32 }}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} width={100} height={36} borderRadius="var(--radius-pill)" />
              ))}
            </div>
            <Skeleton width={160} height={48} borderRadius="var(--radius-md)" style={{ margin: '40px auto 0' }} />
          </div>
        </section>

        {/* Other services skeleton */}
        <section className="svc-other">
          <div className="svc-other-inner">
            <Skeleton width={220} height={24} style={{ marginBottom: 32 }} />
            <div className="svc-other-grid">
              {[0, 1].map((i) => (
                <div key={i} className="svc-other-card" style={{ pointerEvents: 'none' }}>
                  <Skeleton width={48} height={48} variant="rounded" />
                  <Skeleton width="55%" height={18} style={{ marginTop: 20 }} />
                  <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
                  <Skeleton width="100%" height={14} style={{ marginTop: 6 }} />
                  <Skeleton width="70%" height={14} style={{ marginTop: 6 }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                    {[0, 1, 2].map((j) => (
                      <Skeleton key={j} width={70} height={24} borderRadius="var(--radius-pill)" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (error || !service) {
    return (
      <Layout>
        <div className="svc-detail-error">
          <h2>Service not found</h2>
          <p>The service you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="svc-breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <span>Services</span>
        <span className="breadcrumb-sep">/</span>
        <span>{service.title}</span>
      </div>

      {/* Hero */}
      <section className="svc-detail-hero">
        <div className="svc-detail-hero-inner">
          <div className="svc-detail-icon-wrapper">
            {getServiceIcon(service.icon)}
          </div>
          <h1>{service.title}</h1>
          <p className="svc-detail-desc">{service.description}</p>
          <div className="svc-detail-tags">
            {service.tags.map((tag) => (
              <span key={tag} className="svc-tag">{tag}</span>
            ))}
          </div>
          <Link to="/submit" className="svc-detail-cta">
            Get Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Other Services */}
      {otherServices.length > 0 && (
        <section className="svc-other">
          <div className="svc-other-inner">
            <h2>Other Engagement Models</h2>
            <div className="svc-other-grid stagger-children visible">
              {otherServices.map((svc) => (
                <Link key={svc.slug} to={`/services/${svc.slug}`} className="svc-other-card">
                  <div className="svc-other-icon">
                    {getServiceIcon(svc.icon)}
                  </div>
                  <h3>{svc.title}</h3>
                  <p>{svc.description}</p>
                  <div className="svc-other-tags">
                    {svc.tags.map((tag) => (
                      <span key={tag} className="svc-other-tag">{tag}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
