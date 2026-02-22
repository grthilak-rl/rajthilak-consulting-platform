import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchCaseStudies, fetchTestimonials, fetchSiteContent } from '../api/client';
import type { CaseStudy, Testimonial } from '../types';
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

const TAGLINE_DEFAULT = "Engineering Leader. Systems Architect. Technical Consultant.";
const DESCRIPTION_DEFAULT = "I help companies design and build production-grade systems -- from cloud migrations and platform engineering to AI-powered products. Full-time, contract, or one-off.";
const CLIENTS_DEFAULTS = {
  label: "Trusted by teams at",
  names: ["TechCorp", "StartupXYZ", "HealthSys Inc.", "TelecomOne"],
};

const SERVICES_DEFAULTS = {
  overline: "What I Do",
  heading: "Engagement Models",
  subtitle: "Flexible consulting arrangements tailored to your project needs, timeline, and budget.",
  cards: [
    { title: "Full-Time Consulting", description: "Embedded within your team for extended engagements. I bring architecture leadership, code reviews, mentoring, and hands-on development to accelerate your roadmap.", icon: "briefcase", tags: ["Team Integration", "Architecture", "Mentoring"] },
    { title: "Contract Engagements", description: "Scoped projects with clear deliverables and timelines. From API design and cloud migration to full-stack product development -- I own the outcome end to end.", icon: "edit", tags: ["Fixed Scope", "Clear Milestones", "Deliverables"] },
    { title: "One-Off Projects", description: "Need a quick architecture review, tech stack recommendation, or proof-of-concept build? I offer focused engagements to solve specific technical challenges fast.", icon: "clock", tags: ["Architecture Review", "PoC Builds", "Tech Advisory"] },
  ],
};

export default function HomePage() {
  const [visibleElements, setVisibleElements] = useState<Set<number>>(new Set());
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroTagline, setHeroTagline] = useState(TAGLINE_DEFAULT);
  const [heroDescription, setHeroDescription] = useState(DESCRIPTION_DEFAULT);
  const [heroClients, setHeroClients] = useState(CLIENTS_DEFAULTS);
  const [servicesSection, setServicesSection] = useState(SERVICES_DEFAULTS);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [caseStudiesData, testimonialsData, siteContentData] = await Promise.allSettled([
          fetchCaseStudies(),
          fetchTestimonials(),
          fetchSiteContent(),
        ]);
        if (caseStudiesData.status === "fulfilled") setCaseStudies(caseStudiesData.value);
        if (testimonialsData.status === "fulfilled") setTestimonials(testimonialsData.value);
        if (siteContentData.status === "fulfilled") {
          const items = siteContentData.value;
          const tagline = items.find((i) => i.key === "hero_tagline");
          const description = items.find((i) => i.key === "hero_description");
          if (tagline) setHeroTagline(tagline.content);
          if (description) {
            setHeroDescription(description.content);
            const dm = description.metadata as Record<string, unknown> | undefined;
            if (dm) {
              setHeroClients({
                label: (dm.clients_label as string) || CLIENTS_DEFAULTS.label,
                names: (dm.clients as string[]) || CLIENTS_DEFAULTS.names,
              });
            }
          }
          const svcItem = items.find((i) => i.key === "home_services");
          if (svcItem) {
            const m = svcItem.metadata as Record<string, unknown> | undefined;
            setServicesSection({
              overline: (m?.overline as string) || SERVICES_DEFAULTS.overline,
              heading: (m?.heading as string) || SERVICES_DEFAULTS.heading,
              subtitle: svcItem.content || SERVICES_DEFAULTS.subtitle,
              cards: (m?.cards as typeof SERVICES_DEFAULTS.cards) || SERVICES_DEFAULTS.cards,
            });
          }
        }
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
  }, [caseStudies, testimonials]);

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
            {(() => {
              const lines = heroTagline.split(".").map((s) => s.trim()).filter(Boolean);
              return lines.map((line, i) => {
                const text = `${line}.`;
                if (i === lines.length - 1) return <span key={i}><span className="highlight">{text}</span></span>;
                if (i === 1) return <span key={i}><span className="line-2">{text}</span><br /></span>;
                return <span key={i}>{text}<br /></span>;
              });
            })()}
          </h1>

          <p className="home-hero-desc animate-in delay-2">
            {heroDescription}
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
            <div className="home-hero-clients-label">{heroClients.label}</div>
            <div className="home-hero-clients-logos">
              {heroClients.names.map((name) => (
                <span key={name} className="client-logo">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services reveal" data-index={0}>
        <div className={`services-inner ${visibleElements.has(0) ? 'visible' : ''}`}>
          <div className="section-header">
            <div className="section-overline">{servicesSection.overline}</div>
            <h2 className="section-title">{servicesSection.heading}</h2>
            <p className="section-subtitle">{servicesSection.subtitle}</p>
          </div>

          {loading ? (
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
            <div className="services-grid stagger-children">
              {servicesSection.cards.map((card, i) => (
                <div key={i} className="service-card">
                  <div className="service-icon">
                    {getServiceIcon(card.icon)}
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <div className="service-tags">
                    {card.tags.map((tag) => (
                      <span key={tag} className="service-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
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
            <div className="portfolio-grid stagger-children">
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
                          <span key={tech.name} className="tech-pill">{tech.name}</span>
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
            <div className="testimonials-grid stagger-children">
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
