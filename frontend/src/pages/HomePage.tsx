import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchServices, fetchCaseStudies, fetchTestimonials } from '../api/client';
import type { Service, CaseStudy, Testimonial } from '../types';
import Skeleton from '../components/Skeleton';
import './HomePage.css';

// Icon mapping helper
const getServiceIcon = (icon: string) => {
  switch (icon) {
    case 'briefcase':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      );
    case 'edit':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      );
    case 'clock':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      );
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      );
  }
};

const getCaseStudyIcon = (icon: string) => {
  switch (icon) {
    case 'activity':
      return '📈';
    case 'bar-chart':
      return '📊';
    case 'cloud':
      return '☁️';
    case 'microphone':
      return '🎤';
    default:
      return '📁';
  }
};

export default function HomePage() {
  const [visibleElements, setVisibleElements] = useState<Set<number>>(new Set());
  const [services, setServices] = useState<Service[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [servicesData, caseStudiesData, testimonialsData] = await Promise.all([
          fetchServices().catch(() => []),
          fetchCaseStudies().catch(() => []),
          fetchTestimonials().catch(() => []),
        ]);
        setServices(servicesData);
        setCaseStudies(caseStudiesData);
        setTestimonials(testimonialsData);
      } catch (err) {
        // Silently use fallback data on error
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setVisibleElements((prev) => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [services, caseStudies, testimonials]);

  // Get featured case studies for portfolio section (limit to 3)
  const featuredCaseStudies = caseStudies.slice(0, 3);

  return (
    <Layout transparentNav={true}>
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-bg-grid"></div>
        <div className="home-hero-glow-1"></div>
        <div className="home-hero-glow-2"></div>

        <div className="home-hero-content">
          <div className="home-hero-overline animate-in">
            <span className="dot"></span>
            Available for consulting engagements
          </div>

          <h1 className="animate-in delay-1">
            Engineering Leader.<br />
            <span className="line-2">Systems Architect.</span><br />
            <span className="highlight">Technical Consultant.</span>
          </h1>

          <p className="home-hero-desc animate-in delay-2">
            I help companies design and build production-grade systems -- from cloud migrations and platform engineering to AI-powered products. Full-time, contract, or one-off.
          </p>

          <div className="home-hero-actions animate-in delay-3">
            <Link to="/portfolio" className="btn-primary">
              View My Work
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
            <Link to="/submit" className="btn-secondary">
              Submit a Requirement
            </Link>
          </div>

          <div className="home-hero-clients animate-in delay-5">
            <div className="home-hero-clients-label">Trusted by teams at</div>
            <div className="home-hero-clients-logos">
              <span className="client-logo">TechCorp</span>
              <span className="client-logo">StartupXYZ</span>
              <span className="client-logo">HealthSys Inc.</span>
              <span className="client-logo">TelecomOne</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services reveal" data-index={0}>
        <div className={`services-inner ${visibleElements.has(0) ? 'visible' : ''}`}>
          <div className="section-header">
            <div className="section-overline">What I Do</div>
            <h2 className="section-title">Engagement Models</h2>
            <p className="section-subtitle">Flexible consulting arrangements tailored to your project needs, timeline, and budget.</p>
          </div>

          {loading && services.length === 0 ? (
            <div className="services-grid">
              {[0, 1, 2].map((i) => (
                <div key={i} className="service-card" style={{ pointerEvents: 'none' }}>
                  <Skeleton width={52} height={52} variant="rounded" />
                  <Skeleton width="60%" height={20} style={{ marginTop: 20 }} />
                  <Skeleton width="100%" height={14} style={{ marginTop: 12 }} />
                  <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
                  <Skeleton width="75%" height={14} style={{ marginTop: 8 }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                    <Skeleton width={80} height={24} borderRadius="var(--radius-sm)" />
                    <Skeleton width={90} height={24} borderRadius="var(--radius-sm)" />
                    <Skeleton width={70} height={24} borderRadius="var(--radius-sm)" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="services-grid">
              {services.length > 0 ? (
                services.map((service) => (
                  <Link key={service.id} to={`/services/${service.slug}`} className="service-card">
                    <div className="service-icon">
                      {getServiceIcon(service.icon)}
                    </div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <div className="service-tags">
                      {service.tags.map((tag) => (
                        <span key={tag} className="service-tag">{tag}</span>
                      ))}
                    </div>
                  </Link>
                ))
              ) : (
                <>
                  {/* Fallback hardcoded services if API fails */}
                  <div className="service-card">
                    <div className="service-icon">
                      {getServiceIcon('briefcase')}
                    </div>
                    <h3>Full-Time Consulting</h3>
                    <p>Embedded within your team for extended engagements. I bring architecture leadership, code reviews, mentoring, and hands-on development to accelerate your roadmap.</p>
                    <div className="service-tags">
                      <span className="service-tag">Team Integration</span>
                      <span className="service-tag">Architecture</span>
                      <span className="service-tag">Mentoring</span>
                    </div>
                  </div>

                  <div className="service-card">
                    <div className="service-icon">
                      {getServiceIcon('edit')}
                    </div>
                    <h3>Contract Engagements</h3>
                    <p>Scoped projects with clear deliverables and timelines. From API design and cloud migration to full-stack product development -- I own the outcome end to end.</p>
                    <div className="service-tags">
                      <span className="service-tag">Fixed Scope</span>
                      <span className="service-tag">Clear Milestones</span>
                      <span className="service-tag">Deliverables</span>
                    </div>
                  </div>

                  <div className="service-card">
                    <div className="service-icon">
                      {getServiceIcon('clock')}
                    </div>
                    <h3>One-Off Projects</h3>
                    <p>Need a quick architecture review, tech stack recommendation, or proof-of-concept build? I offer focused engagements to solve specific technical challenges fast.</p>
                    <div className="service-tags">
                      <span className="service-tag">Architecture Review</span>
                      <span className="service-tag">PoC Builds</span>
                      <span className="service-tag">Tech Advisory</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Portfolio Highlights */}
      <section className="portfolio-preview reveal" data-index={1}>
        <div className={`portfolio-inner ${visibleElements.has(1) ? 'visible' : ''}`}>
          <div className="section-header">
            <div className="section-overline">Portfolio</div>
            <h2 className="section-title">Featured Work</h2>
            <p className="section-subtitle">Real-world systems designed, built, and shipped across multiple industries.</p>
          </div>

          {loading && caseStudies.length === 0 ? (
            <div className="portfolio-grid">
              {[0, 1, 2].map((i) => (
                <div key={i} className="port-card" style={{ pointerEvents: 'none' }}>
                  <div className="port-card-top" style={{ background: 'var(--color-gray-100)' }} />
                  <div className="port-card-body">
                    <Skeleton width="50%" height={18} />
                    <Skeleton width="40%" height={13} style={{ marginTop: 4 }} />
                    <Skeleton width="100%" height={14} style={{ marginTop: 12 }} />
                    <Skeleton width="85%" height={14} style={{ marginTop: 6 }} />
                    <div style={{ display: 'flex', gap: 4, marginTop: 16 }}>
                      <Skeleton width={60} height={22} borderRadius="var(--radius-sm)" />
                      <Skeleton width={65} height={22} borderRadius="var(--radius-sm)" />
                      <Skeleton width={55} height={22} borderRadius="var(--radius-sm)" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="portfolio-grid">
              {featuredCaseStudies.length > 0 ? (
                featuredCaseStudies.map((caseStudy) => (
                  <Link key={caseStudy.id} to={`/portfolio/${caseStudy.slug}`} className="port-card">
                    <div className={`port-card-top visual-${caseStudy.visual.color}`}>
                      <span className="card-icon">{getCaseStudyIcon(caseStudy.visual.icon)}</span>
                    </div>
                    <div className="port-card-body">
                      <h3>{caseStudy.title}</h3>
                      <div className="port-card-role">{caseStudy.role}</div>
                      <p className="port-card-desc">{caseStudy.description}</p>
                      <div className="port-card-tech">
                        {caseStudy.technologies.map((tech) => (
                          <span key={tech} className="tech-pill">{tech}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <>
                  {/* Fallback hardcoded case studies if API fails */}
                  <div className="port-card">
                    <div className="port-card-top visual-healthcare">
                      <span className="card-icon">📈</span>
                    </div>
                    <div className="port-card-body">
                      <h3>HIT Platform</h3>
                      <div className="port-card-role">Lead Backend Engineer</div>
                      <p className="port-card-desc">A healthcare information technology platform designed to streamline clinical workflows and enable seamless interoperability across hospital systems.</p>
                      <div className="port-card-tech">
                        <span className="tech-pill">Python</span>
                        <span className="tech-pill">FastAPI</span>
                        <span className="tech-pill">React</span>
                        <span className="tech-pill">PostgreSQL</span>
                        <span className="tech-pill">Docker</span>
                      </div>
                    </div>
                  </div>

                  <div className="port-card">
                    <div className="port-card-top visual-telecom">
                      <span className="card-icon">📊</span>
                    </div>
                    <div className="port-card-body">
                      <h3>VAS Platform</h3>
                      <div className="port-card-role">Full Stack Developer</div>
                      <p className="port-card-desc">A value-added services platform enabling telecom operators to deliver digital content and billing integration at scale for millions of subscribers.</p>
                      <div className="port-card-tech">
                        <span className="tech-pill">Java</span>
                        <span className="tech-pill">Spring Boot</span>
                        <span className="tech-pill">Kafka</span>
                        <span className="tech-pill">Redis</span>
                        <span className="tech-pill">AWS</span>
                      </div>
                    </div>
                  </div>

                  <div className="port-card">
                    <div className="port-card-top visual-ai">
                      <span className="card-icon">🎤</span>
                    </div>
                    <div className="port-card-body">
                      <h3>Ruth AI</h3>
                      <div className="port-card-role">AI/ML Engineer & Architect</div>
                      <p className="port-card-desc">An AI-powered conversational assistant built to automate customer support, handle complex queries, and reduce response times through intelligent routing.</p>
                      <div className="port-card-tech">
                        <span className="tech-pill">Python</span>
                        <span className="tech-pill">LangChain</span>
                        <span className="tech-pill">OpenAI</span>
                        <span className="tech-pill">FastAPI</span>
                        <span className="tech-pill">React</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <Link to="/portfolio" className="view-all-link">
            View all projects
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials reveal" data-index={2}>
        <div className={`testimonials-inner ${visibleElements.has(2) ? 'visible' : ''}`}>
          <div className="section-header">
            <div className="section-overline">Testimonials</div>
            <h2 className="section-title">What Clients Say</h2>
            <p className="section-subtitle">Feedback from engineering leaders and founders I have worked with.</p>
          </div>

          {loading && testimonials.length === 0 ? (
            <div className="testimonials-grid">
              {[0, 1, 2].map((i) => (
                <div key={i} className="testimonial-card" style={{ pointerEvents: 'none' }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Skeleton key={s} width={14} height={14} />
                    ))}
                  </div>
                  <Skeleton width="100%" height={14} />
                  <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
                  <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
                  <Skeleton width="60%" height={14} style={{ marginTop: 8 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                    <Skeleton width={40} height={40} variant="circle" />
                    <div>
                      <Skeleton width={100} height={14} />
                      <Skeleton width={140} height={12} style={{ marginTop: 4 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="testimonials-grid">
              {testimonials.length > 0 ? (
                testimonials.slice(0, 3).map((testimonial) => (
                  <div key={testimonial.id} className="testimonial-card">
                    <div className="testimonial-stars">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <span key={i} className="star">★</span>
                      ))}
                    </div>
                    <p className="testimonial-quote">"{testimonial.content}"</p>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar">{testimonial.author_initials}</div>
                      <div>
                        <div className="testimonial-name">{testimonial.author_name}</div>
                        <div className="testimonial-role">{testimonial.author_role}, {testimonial.author_company}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {/* Fallback hardcoded testimonials if API fails */}
                  <div className="testimonial-card">
                    <div className="testimonial-stars">
                      <span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span>
                    </div>
                    <p className="testimonial-quote">"Raj took our fragmented on-premise systems and designed a clean migration path to AWS. His architecture decisions saved us months of rework. Truly an engineer who thinks in systems."</p>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar">AJ</div>
                      <div>
                        <div className="testimonial-name">Alice Johnson</div>
                        <div className="testimonial-role">VP Engineering, TechCorp</div>
                      </div>
                    </div>
                  </div>

                  <div className="testimonial-card">
                    <div className="testimonial-stars">
                      <span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span>
                    </div>
                    <p className="testimonial-quote">"We needed someone who could both architect the system and write production code. Raj delivered our MVP two weeks ahead of schedule and the codebase was impeccable. Highly recommend."</p>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar">BM</div>
                      <div>
                        <div className="testimonial-name">Bob Martinez</div>
                        <div className="testimonial-role">CTO, StartupXYZ</div>
                      </div>
                    </div>
                  </div>

                  <div className="testimonial-card">
                    <div className="testimonial-stars">
                      <span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span>
                    </div>
                    <p className="testimonial-quote">"The AI assistant Raj built for our support team cut response times by 60% and handles 85% of incoming queries autonomously. The ROI was evident within the first month of deployment."</p>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar">SK</div>
                      <div>
                        <div className="testimonial-name">Sarah Kim</div>
                        <div className="testimonial-role">Head of Product, Ruth Labs</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bottom-cta reveal" data-index={3}>
        <div className={`bottom-cta-inner ${visibleElements.has(3) ? 'visible' : ''}`}>
          <div className="cta-card">
            <div className="cta-content">
              <h2>Ready to build something great?</h2>
              <p>Tell me about your project and I will get back to you within 24 hours with a plan of action.</p>
              <Link to="/submit" className="cta-button">
                Submit a Requirement
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
