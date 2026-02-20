import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchCaseStudies } from '../api/client';
import type { CaseStudy } from '../types';
import Skeleton from '../components/Skeleton';
import useCountUp from '../hooks/useCountUp';
import './PortfolioPage.css';

export default function PortfolioPage() {
  const [selectedIndustry, setSelectedIndustry] = useState('All Projects');
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleElements, setVisibleElements] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function loadCaseStudies() {
      try {
        setLoading(true);
        const data = await fetchCaseStudies();
        setCaseStudies(data);
      } catch (err) {
        // Use fallback mock data on error
        // Fallback mock data if API fails
        setCaseStudies([
          {
            id: 'ruth-ai',
            slug: 'ruth-ai',
            title: 'Ruth AI',
            role: 'AI/ML Engineer & Architect',
            description: 'An AI-powered conversational assistant built to automate customer support, handle complex queries with context awareness, and reduce response times through intelligent routing.',
            industry: 'AI / ML',
            technologies: ['Python', 'LangChain', 'OpenAI', 'FastAPI', 'React'],
            featured: true,
            metrics: [
              { value: '60%', label: 'Faster Response Time' },
              { value: '85%', label: 'Query Resolution Rate' },
              { value: '24/7', label: 'Availability' }
            ],
            visual: { color: 'ai', icon: 'microphone' },
            display_order: 0,
            is_active: true,
          },
          {
            id: 'hit-platform',
            slug: 'hit-platform',
            title: 'HIT Platform',
            role: 'Lead Backend Engineer',
            description: 'A healthcare information technology platform designed to streamline clinical workflows, improve patient data management, and enable seamless interoperability across hospital systems.',
            industry: 'Healthcare',
            technologies: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'Docker'],
            featured: false,
            visual: { color: 'healthcare', icon: 'activity' },
            display_order: 1,
            is_active: true,
          },
          {
            id: 'vas-platform',
            slug: 'vas-platform',
            title: 'VAS Platform',
            role: 'Full Stack Developer',
            description: 'A value-added services platform enabling telecom operators to deliver digital content, subscription management, and billing integration at scale for millions of subscribers.',
            industry: 'Telecom',
            technologies: ['Java', 'Spring Boot', 'Kafka', 'Redis', 'AWS'],
            featured: false,
            visual: { color: 'telecom', icon: 'bar-chart' },
            display_order: 2,
            is_active: true,
          },
          {
            id: 'cloud-migration',
            slug: 'cloud-migration',
            title: 'Cloud Migration Strategy',
            role: 'Solutions Architect',
            description: 'Architecture review, migration planning, and hands-on support for containerizing on-premise services and migrating infrastructure to AWS for a mid-size enterprise.',
            industry: 'Cloud / DevOps',
            technologies: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
            featured: false,
            visual: { color: 'fintech', icon: 'cloud' },
            display_order: 3,
            is_active: true,
          }
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadCaseStudies();
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
  }, [caseStudies]);

  // Dynamically build filter options from actual data
  const industries = ['All Projects', ...Array.from(new Set(caseStudies.map(p => p.industry)))];
  const allTechnologies = Array.from(new Set(caseStudies.flatMap(p => p.technologies)));
  const techFilters = allTechnologies.slice(0, 4); // Show top 4 technologies

  const industryCount = useCountUp({ end: industries.length - 1, duration: 1000 });
  const projectCount = useCountUp({ end: caseStudies.length, duration: 1200 });
  const techCount = useCountUp({ end: allTechnologies.length, duration: 1400 });

  const filteredProjects = caseStudies.filter((p) => {
    const industryMatch = selectedIndustry === 'All Projects' || p.industry === selectedIndustry;
    const techMatch = selectedTech.length === 0 || selectedTech.some((tech) => p.technologies.includes(tech));
    return industryMatch && techMatch;
  });

  const featuredProject = caseStudies.find((p) => p.featured);
  const regularProjects = filteredProjects.filter((p) => !p.featured);

  const toggleTech = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const getIconEmoji = (icon: string) => {
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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="portfolio-hero">
        <div className="portfolio-hero-overline animate-in">Projects & Portfolio</div>
        <h1 className="animate-in delay-1">
          Systems I Have <span className="highlight">Designed & Built</span>
        </h1>
        <p className="portfolio-hero-subtitle animate-in delay-2">
          From healthcare platforms processing thousands of patient records to AI assistants handling millions of conversations -- here is the work that defines my engineering practice.
        </p>

        <div className="portfolio-hero-stats animate-in delay-3">
          <div className="stat">
            <div className="stat-number" ref={industryCount.ref}>{industryCount.count}+</div>
            <div className="stat-label">Industries</div>
          </div>
          <div className="stat">
            <div className="stat-number" ref={projectCount.ref}>{projectCount.count}+</div>
            <div className="stat-label">Projects Delivered</div>
          </div>
          <div className="stat">
            <div className="stat-number" ref={techCount.ref}>{techCount.count}+</div>
            <div className="stat-label">Technologies</div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="filter-section animate-in delay-4">
        <div className="filter-bar">
          <span className="filter-label">Filter by</span>
          {industries.map((industry) => (
            <button
              key={industry}
              className={`filter-pill ${selectedIndustry === industry ? 'active' : ''}`}
              onClick={() => setSelectedIndustry(industry)}
            >
              {industry}
            </button>
          ))}
          {techFilters.length > 0 && (
            <>
              <div className="filter-divider"></div>
              <span className="filter-label">Tech</span>
              {techFilters.map((tech) => (
                <button
                  key={tech}
                  className={`filter-pill ${selectedTech.includes(tech) ? 'active' : ''}`}
                  onClick={() => toggleTech(tech)}
                >
                  {tech}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Featured Project */}
      {loading && caseStudies.length === 0 ? (
        <section className="featured-section">
          <div className="section-reveal">
            <div className="section-label">Featured Project</div>
            <div className="featured-card" style={{ pointerEvents: 'none' }}>
              <div className="featured-visual" style={{ background: 'var(--color-gray-100)' }}>
                <Skeleton width={80} height={80} borderRadius={20} />
                <Skeleton width={120} height={14} style={{ marginTop: 24 }} />
              </div>
              <div className="featured-content">
                <Skeleton width={80} height={24} borderRadius="var(--radius-pill)" />
                <Skeleton width="70%" height={28} style={{ marginTop: 20 }} />
                <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
                <Skeleton width="100%" height={14} style={{ marginTop: 20 }} />
                <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
                <Skeleton width="75%" height={14} style={{ marginTop: 8 }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} width={70} height={26} borderRadius="var(--radius-sm)" />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 32, marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i}>
                      <Skeleton width={60} height={24} />
                      <Skeleton width={100} height={12} style={{ marginTop: 4 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : featuredProject ? (
        <section className="featured-section reveal" data-index={0}>
          <div className={`section-reveal ${visibleElements.has(0) ? 'visible' : ''}`}>
            <div className="section-label">Featured Project</div>
            <Link to={`/portfolio/${featuredProject.slug}`} className="featured-card">
              <div className={`featured-visual visual-${featuredProject.visual.color}`}>
                <div className="featured-icon">{getIconEmoji(featuredProject.visual.icon)}</div>
                <div className="featured-visual-label">{featuredProject.slug} / v2.4</div>
              </div>
              <div className="featured-content">
                <div className="featured-badge">
                  ⭐ Featured
                </div>
                <h3 className="featured-title">{featuredProject.title}</h3>
                <div className="featured-role">{featuredProject.role}</div>
                <p className="featured-desc">{featuredProject.description}</p>
                <div className="featured-tech">
                  {featuredProject.technologies.map((tech) => (
                    <span key={tech} className="tech-badge">{tech}</span>
                  ))}
                </div>
                {featuredProject.metrics && (
                  <div className="featured-metrics">
                    {featuredProject.metrics.map((metric, i) => (
                      <div key={i}>
                        <div className="metric-value">{metric.value}</div>
                        <div className="metric-label">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </div>
        </section>
      ) : null}

      {/* All Projects Grid */}
      <section className="projects-section reveal" data-index={1}>
        <div className={`section-reveal ${visibleElements.has(1) ? 'visible' : ''}`}>
          <div className="projects-header">
            <h2>All Projects</h2>
            <span className="projects-count">{regularProjects.length} projects</span>
          </div>

          {loading && caseStudies.length === 0 ? (
            <div className="projects-grid">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="project-card" style={{ pointerEvents: 'none' }}>
                  <div className="project-card-visual" style={{ background: 'var(--color-gray-100)' }}>
                    <Skeleton width={48} height={48} variant="circle" style={{ position: 'relative', zIndex: 1, margin: 'auto' }} />
                  </div>
                  <div className="project-card-body">
                    <Skeleton width="55%" height={18} />
                    <Skeleton width="35%" height={13} style={{ marginTop: 4 }} />
                    <Skeleton width="100%" height={14} style={{ marginTop: 12 }} />
                    <Skeleton width="100%" height={14} style={{ marginTop: 6 }} />
                    <Skeleton width="70%" height={14} style={{ marginTop: 6 }} />
                    <div style={{ display: 'flex', gap: 4, marginTop: 16 }}>
                      {[0, 1, 2].map((j) => (
                        <Skeleton key={j} width={60} height={22} borderRadius="var(--radius-sm)" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="projects-grid stagger-children">
              {regularProjects.map((project) => (
                <Link key={project.id} to={`/portfolio/${project.slug}`} className="project-card">
                  <div className="project-card-visual">
                    <div className={`visual-bg visual-${project.visual.color}`}>
                      {getIconEmoji(project.visual.icon)}
                    </div>
                    <div className="visual-pattern"></div>
                    <span className="project-card-industry">{project.industry}</span>
                  </div>
                  <div className="project-card-body">
                    <h3 className="project-card-title">{project.title}</h3>
                    <div className="project-card-role">{project.role}</div>
                    <p className="project-card-desc">{project.description}</p>
                    <div className="project-card-footer">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="tech-badge">{tech}</span>
                      ))}
                    </div>
                  </div>
                  <div className="project-card-arrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"/>
                      <polyline points="7 7 17 7 17 17"/>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Skills Overview */}
      <section className="skills-section reveal" data-index={2}>
        <div className={`section-reveal ${visibleElements.has(2) ? 'visible' : ''}`}>
          <div className="skills-card">
            <div className="skills-header">
              <h2>Technical Expertise</h2>
              <p>Technologies and tools I work with across the full stack</p>
            </div>
            <div className="skills-grid stagger-children">
              <div className="skill-group">
                <h3>Languages</h3>
                <div className="skill-group-items">
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">Python</span></div>
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">Java</span></div>
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">TypeScript</span></div>
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">JavaScript</span></div>
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">SQL</span></div>
                </div>
              </div>
              <div className="skill-group">
                <h3>Frameworks</h3>
                <div className="skill-group-items">
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">FastAPI</span></div>
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">React</span></div>
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">Spring Boot</span></div>
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">LangChain</span></div>
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">SQLAlchemy</span></div>
                </div>
              </div>
              <div className="skill-group">
                <h3>Infrastructure</h3>
                <div className="skill-group-items">
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">AWS</span></div>
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">Docker</span></div>
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">Kubernetes</span></div>
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">Terraform</span></div>
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">Nginx</span></div>
                </div>
              </div>
              <div className="skill-group">
                <h3>Data & Messaging</h3>
                <div className="skill-group-items">
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">PostgreSQL</span></div>
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">Redis</span></div>
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">Kafka</span></div>
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">OpenAI API</span></div>
                  <div className="skill-item"><span className="skill-dot"></span><span className="skill-name">Alembic</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section reveal" data-index={3}>
        <div className={`section-reveal ${visibleElements.has(3) ? 'visible' : ''}`}>
          <div className="cta-card">
            <div className="cta-content">
              <h2>Have a project in mind?</h2>
              <p>Whether it is a cloud migration, an MVP build, or an AI integration -- let us talk about how I can help your team ship.</p>
              <a href="/submit" className="cta-button">
                Submit a Requirement
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
