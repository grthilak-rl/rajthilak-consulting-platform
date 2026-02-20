import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchCaseStudy, fetchCaseStudies } from '../api/client';
import type { CaseStudy } from '../types';
import Skeleton from '../components/Skeleton';
import './CaseStudyDetail.css';

const getIconEmoji = (icon: string) => {
  switch (icon) {
    case 'activity': return '📈';
    case 'bar-chart': return '📊';
    case 'cloud': return '☁️';
    case 'microphone': return '🎤';
    default: return '📁';
  }
};

export default function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [relatedStudies, setRelatedStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      setError(false);
      try {
        const [study, allStudies] = await Promise.all([
          fetchCaseStudy(slug),
          fetchCaseStudies().catch(() => []),
        ]);
        setCaseStudy(study);
        setRelatedStudies(allStudies.filter(s => s.slug !== slug).slice(0, 2));
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
        <div className="detail-breadcrumb">
          <Skeleton width={60} height={13} style={{ display: 'inline-block' }} />
          <span className="breadcrumb-sep">/</span>
          <Skeleton width={120} height={13} style={{ display: 'inline-block' }} />
        </div>

        {/* Hero skeleton */}
        <section className="detail-hero">
          <div className="detail-hero-inner">
            <div className="detail-hero-text">
              <Skeleton width={100} height={26} borderRadius="var(--radius-pill)" />
              <Skeleton width="80%" height={40} style={{ marginTop: 20 }} />
              <Skeleton width="35%" height={17} style={{ marginTop: 12 }} />
              <Skeleton width="100%" height={14} style={{ marginTop: 20 }} />
              <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
              <Skeleton width="70%" height={14} style={{ marginTop: 8 }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} width={80} height={30} borderRadius="var(--radius-sm)" />
                ))}
              </div>
            </div>
            <Skeleton width="100%" height={360} variant="rounded" />
          </div>
        </section>

        {/* Metrics skeleton */}
        <section className="detail-metrics">
          <div className="detail-metrics-inner">
            <Skeleton width={140} height={24} style={{ margin: '0 auto 40px' }} />
            <div className="detail-metrics-grid">
              {[0, 1, 2].map((i) => (
                <div key={i} className="detail-metric-card" style={{ pointerEvents: 'none' }}>
                  <Skeleton width={80} height={40} style={{ margin: '0 auto' }} />
                  <Skeleton width={120} height={14} style={{ margin: '8px auto 0' }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related projects skeleton */}
        <section className="detail-related">
          <div className="detail-related-inner">
            <Skeleton width={160} height={24} style={{ marginBottom: 32 }} />
            <div className="detail-related-grid">
              {[0, 1].map((i) => (
                <div key={i} className="related-card" style={{ pointerEvents: 'none' }}>
                  <div className="related-card-visual" style={{ background: 'var(--color-gray-100)' }}>
                    <Skeleton width={40} height={40} variant="circle" style={{ margin: 'auto' }} />
                  </div>
                  <div className="related-card-body">
                    <Skeleton width={80} height={11} />
                    <Skeleton width="60%" height={18} style={{ marginTop: 8 }} />
                    <Skeleton width="45%" height={13} style={{ marginTop: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (error || !caseStudy) {
    return (
      <Layout>
        <div className="detail-error">
          <h2>Case study not found</h2>
          <p>The case study you're looking for doesn't exist or has been removed.</p>
          <Link to="/portfolio" className="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Portfolio
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="detail-breadcrumb">
        <Link to="/portfolio">Portfolio</Link>
        <span className="breadcrumb-sep">/</span>
        <span>{caseStudy.title}</span>
      </div>

      {/* Hero */}
      <section className="detail-hero">
        <div className="detail-hero-inner">
          <div className="detail-hero-text">
            <div className="detail-industry-badge">{caseStudy.industry}</div>
            <h1>{caseStudy.title}</h1>
            <div className="detail-role">{caseStudy.role}</div>
            <p className="detail-description">{caseStudy.description}</p>

            <div className="detail-tech-list">
              {caseStudy.technologies.map((tech) => (
                <span key={tech} className="tech-badge">{tech}</span>
              ))}
            </div>
          </div>

          <div className={`detail-hero-visual visual-${caseStudy.visual.color}`}>
            <div className="detail-visual-icon">{getIconEmoji(caseStudy.visual.icon)}</div>
            <div className="detail-visual-label">{caseStudy.slug}</div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      {caseStudy.metrics && caseStudy.metrics.length > 0 && (
        <section className="detail-metrics">
          <div className="detail-metrics-inner">
            <h2>Key Results</h2>
            <div className="detail-metrics-grid stagger-children visible">
              {caseStudy.metrics.map((metric, i) => (
                <div key={i} className="detail-metric-card">
                  <div className="detail-metric-value">{metric.value}</div>
                  <div className="detail-metric-label">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="detail-cta">
        <div className="detail-cta-inner">
          <h2>Interested in a similar project?</h2>
          <p>Let's discuss how I can help you build something great.</p>
          <Link to="/submit" className="cta-button">
            Submit a Requirement
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Related Projects */}
      {relatedStudies.length > 0 && (
        <section className="detail-related">
          <div className="detail-related-inner">
            <h2>Other Projects</h2>
            <div className="detail-related-grid stagger-children visible">
              {relatedStudies.map((study) => (
                <Link key={study.slug} to={`/portfolio/${study.slug}`} className="related-card">
                  <div className={`related-card-visual visual-${study.visual.color}`}>
                    <span className="related-icon">{getIconEmoji(study.visual.icon)}</span>
                  </div>
                  <div className="related-card-body">
                    <span className="related-industry">{study.industry}</span>
                    <h3>{study.title}</h3>
                    <div className="related-role">{study.role}</div>
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
