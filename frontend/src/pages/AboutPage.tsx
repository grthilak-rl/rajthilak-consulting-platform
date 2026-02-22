import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { fetchTestimonials, fetchSiteContent, fetchCaseStudies } from '../api/client';
import type { Testimonial, SiteContent, CaseStudy } from '../types';
import Skeleton from '../components/Skeleton';
import useCountUp from '../hooks/useCountUp';
import './AboutPage.css';

// Fallback values for hero section
const HERO_DEFAULTS = {
  overline: "About Me",
  heading: 'Building <span class="highlight">Scalable Systems</span> That Ship',
  content: "I am Raj Thilak, a full-stack engineer and technical consultant with over a decade of experience designing and shipping production systems across healthcare, telecom, AI/ML, and fintech.",
  stats: [
    { value: 10, suffix: "+", label: "Years Experience" },
    { value: 20, suffix: "+", label: "Projects Delivered" },
    { value: 4, suffix: "", label: "Industries" },
  ],
  avatar: { initials: "RT", name: "Raj Thilak", title: "Engineering Consultant & Architect", github: "https://github.com/rajthilak", linkedin: "https://linkedin.com/in/rajthilak", email: "raj@example.com" },
};

const STORY_DEFAULT = (
  "<p>I started my career as a backend developer at a telecom company, building value-added services that reached millions of subscribers. The scale forced me to think deeply about <strong>distributed systems, data pipelines, and fault tolerance</strong> from day one.</p>" +
  "<p>After working on backend platforms in Java and Spring Boot, I transitioned to healthcare technology, where I led the development of a <strong>clinical workflow platform</strong> serving hospitals. This experience taught me how to design systems under regulatory constraints while maintaining performance and usability.</p>" +
  "<hr>" +
  "<p>More recently, I have been building <strong>AI-powered products</strong> using Python, LangChain, and OpenAI APIs. One of my flagship projects, Ruth AI, is a conversational assistant that handles customer support queries with 85% autonomous resolution and 60% faster response times.</p>" +
  "<p>Today, I work as an independent consultant, helping startups and mid-size companies architect, build, and ship production systems. Whether it is a cloud migration, an MVP build, or an AI integration -- I bring hands-on engineering, architectural clarity, and a commitment to delivery.</p>"
);

const WHY_PLATFORM_DEFAULT = (
  "<p>Most consulting engagements start with email threads, scattered proposals, and unclear expectations. I built this platform to bring <strong>structure, transparency, and clarity</strong> to how I work with clients.</p>" +
  "<p>Here, you can submit a requirement, track its progress, and communicate directly with me through a single interface. No middlemen, no ambiguity -- just a streamlined workflow designed to get your project off the ground faster.</p>"
);

const PHILOSOPHY_DEFAULTS = {
  overline: "Engineering Philosophy",
  heading: "How I Approach Engineering",
  subtitle: "Four principles that guide every project I take on, from architecture to deployment.",
  cards: [
    { title: "Ship Early, Iterate Fast", description: "I prioritize getting a working system in front of users as quickly as possible. Early feedback beats perfect architecture every time. Start with an MVP, learn from real usage, and iterate based on what actually matters." },
    { title: "Boring Tech Over Hype", description: "I default to proven, well-documented technologies unless there is a clear reason to do otherwise. PostgreSQL over a trendy NoSQL database. FastAPI over experimental frameworks. Battle-tested tools ship faster and break less." },
    { title: "Design for Observability", description: "Systems will fail. When they do, you need to know exactly what went wrong. I build with structured logging, metrics, and monitoring from day one -- not as an afterthought. If you cannot measure it, you cannot improve it." },
    { title: "Write Code People Can Read", description: "Code is read far more often than it is written. I optimize for clarity over cleverness. Good variable names, small functions, and clear separation of concerns make systems easier to extend, debug, and hand off to your team." },
  ],
};

interface TechCategory {
  name: string;
  techs: string[];
}

interface TechStackData {
  overline: string;
  heading: string;
  subtitle: string;
  categories: TechCategory[];
}

const TECH_STACK_DEFAULTS: TechStackData = {
  overline: "Technical Stack",
  heading: "What I Work With",
  subtitle: "Technologies and tools I use across the full stack, from infrastructure to frontend.",
  categories: [
    { name: "Backend & APIs", techs: ["Python", "FastAPI", "Java", "Spring Boot", "Node.js", "GraphQL"] },
    { name: "Frontend", techs: ["React", "TypeScript", "Next.js", "Vue.js", "TailwindCSS"] },
    { name: "Data & Messaging", techs: ["PostgreSQL", "Redis", "Kafka", "MongoDB"] },
    { name: "Cloud & DevOps", techs: ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions"] },
    { name: "AI & ML", techs: ["OpenAI", "LangChain", "Pinecone", "Hugging Face"] },
    { name: "Tools & Practices", techs: ["Git", "pytest", "Jest", "OpenAPI"] },
  ],
};

export default function AboutPage() {
  const [visibleElements, setVisibleElements] = useState<Set<number>>(new Set());
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroContent, setHeroContent] = useState<SiteContent | null>(null);
  const [storyHtml, setStoryHtml] = useState(STORY_DEFAULT);
  const [whyPlatformHtml, setWhyPlatformHtml] = useState(WHY_PLATFORM_DEFAULT);
  const [philosophy, setPhilosophy] = useState(PHILOSOPHY_DEFAULTS);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [techStack, setTechStack] = useState<TechStackData>(TECH_STACK_DEFAULTS);

  // Derive hero display values from API data or fallbacks
  const meta = heroContent?.metadata as Record<string, unknown> | undefined;
  const heroOverline = (meta?.overline as string) || HERO_DEFAULTS.overline;
  const heroHeading = (meta?.heading as string) || HERO_DEFAULTS.heading;
  const heroLead = heroContent?.content || HERO_DEFAULTS.content;
  const heroStats = (meta?.stats as typeof HERO_DEFAULTS.stats) || HERO_DEFAULTS.stats;
  const heroAvatar = (meta?.avatar as typeof HERO_DEFAULTS.avatar) || HERO_DEFAULTS.avatar;

  const yearsCounter = useCountUp({ end: heroStats[0]?.value ?? 10, duration: 1200 });
  const projectsCounter = useCountUp({ end: heroStats[1]?.value ?? 20, duration: 1400 });
  const industriesCounter = useCountUp({ end: heroStats[2]?.value ?? 4, duration: 1000 });

  const techProficiency = useMemo(() => {
    const map = new Map<string, number>();
    const total = caseStudies.length;
    if (total === 0) return map;

    const countMap = new Map<string, number>();
    let maxCount = 1;
    for (const cs of caseStudies) {
      for (const tech of cs.technologies) {
        const k = tech.name.toLowerCase();
        const newCount = (countMap.get(k) || 0) + 1;
        countMap.set(k, newCount);
        if (newCount > maxCount) maxCount = newCount;
      }
    }

    // Scale proficiency: 0 uses → 15%, max uses → 95%, linearly between
    for (const cat of techStack.categories) {
      for (const techName of cat.techs) {
        const count = countMap.get(techName.toLowerCase()) || 0;
        const proficiency = count === 0 ? 15 : Math.round(15 + (count / maxCount) * 80);
        map.set(techName, proficiency);
      }
    }
    return map;
  }, [caseStudies, techStack]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [testimonialsData, siteContentData, caseStudiesData] = await Promise.allSettled([
          fetchTestimonials(),
          fetchSiteContent(),
          fetchCaseStudies(),
        ]);

        if (testimonialsData.status === "fulfilled") {
          setTestimonials(testimonialsData.value);
        } else {
          // Fallback mock data if API fails
          setTestimonials([
            {
              id: '1',
              author_name: 'Alice Johnson',
              author_role: 'VP Engineering',
              author_company: 'TechCorp',
              author_initials: 'AJ',
              content: 'Raj took our fragmented on-premise systems and designed a clean migration path to AWS. His architecture decisions saved us months of rework. Truly an engineer who thinks in systems.',
              rating: 5,
              featured: true
            },
            {
              id: '2',
              author_name: 'Bob Martinez',
              author_role: 'CTO',
              author_company: 'StartupXYZ',
              author_initials: 'BM',
              content: 'We needed someone who could both architect the system and write production code. Raj delivered our MVP two weeks ahead of schedule and the codebase was impeccable. Highly recommend.',
              rating: 5,
              featured: true
            },
            {
              id: '3',
              author_name: 'Sarah Kim',
              author_role: 'Head of Product',
              author_company: 'Ruth Labs',
              author_initials: 'SK',
              content: 'The AI assistant Raj built for our support team cut response times by 60% and handles 85% of incoming queries autonomously. The ROI was evident within the first month of deployment.',
              rating: 5,
              featured: true
            }
          ]);
        }

        if (siteContentData.status === "fulfilled") {
          const items = siteContentData.value;
          const hero = items.find((i) => i.key === "about_hero");
          const story = items.find((i) => i.key === "about_story");
          const whyPlatform = items.find((i) => i.key === "about_why_platform");
          const philItem = items.find((i) => i.key === "about_philosophy");
          if (hero) setHeroContent(hero);
          if (story) setStoryHtml(story.content);
          if (whyPlatform) setWhyPlatformHtml(whyPlatform.content);
          if (philItem) {
            const pm = philItem.metadata as Record<string, unknown> | undefined;
            setPhilosophy({
              overline: (pm?.overline as string) || PHILOSOPHY_DEFAULTS.overline,
              heading: (pm?.heading as string) || PHILOSOPHY_DEFAULTS.heading,
              subtitle: philItem.content || PHILOSOPHY_DEFAULTS.subtitle,
              cards: (pm?.cards as typeof PHILOSOPHY_DEFAULTS.cards) || PHILOSOPHY_DEFAULTS.cards,
            });
          }
          const techItem = items.find((i) => i.key === "about_tech_stack");
          if (techItem) {
            const tm = techItem.metadata as Record<string, unknown> | undefined;
            if (tm?.categories) {
              setTechStack({
                overline: (tm.overline as string) || TECH_STACK_DEFAULTS.overline,
                heading: (tm.heading as string) || TECH_STACK_DEFAULTS.heading,
                subtitle: techItem.content || TECH_STACK_DEFAULTS.subtitle,
                categories: (tm.categories as TechCategory[]) || TECH_STACK_DEFAULTS.categories,
              });
            }
          }
        }

        if (caseStudiesData.status === "fulfilled") {
          setCaseStudies(caseStudiesData.value);
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
  }, [testimonials]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="about-hero-text">
            <div className="overline animate-in">{heroOverline}</div>
            <h1 className="animate-in delay-1" dangerouslySetInnerHTML={{ __html: heroHeading }} />
            <p className="lead animate-in delay-2">{heroLead}</p>
            <div className="about-hero-stats animate-in delay-3">
              <div className="about-stat">
                <div className="about-stat-num" ref={yearsCounter.ref}>{yearsCounter.count}{heroStats[0]?.suffix ?? "+"}</div>
                <div className="about-stat-label">{heroStats[0]?.label ?? "Years Experience"}</div>
              </div>
              <div className="about-stat">
                <div className="about-stat-num" ref={projectsCounter.ref}>{projectsCounter.count}{heroStats[1]?.suffix ?? "+"}</div>
                <div className="about-stat-label">{heroStats[1]?.label ?? "Projects Delivered"}</div>
              </div>
              <div className="about-stat">
                <div className="about-stat-num" ref={industriesCounter.ref}>{industriesCounter.count}{heroStats[2]?.suffix ?? ""}</div>
                <div className="about-stat-label">{heroStats[2]?.label ?? "Industries"}</div>
              </div>
            </div>
          </div>

          <div className="about-avatar-card animate-in delay-4">
            <div className="avatar-circle">{heroAvatar.initials}</div>
            <div className="avatar-name">{heroAvatar.name}</div>
            <div className="avatar-title">{heroAvatar.title}</div>
            <div className="avatar-links">
              {heroAvatar.github && (
                <a href={heroAvatar.github} target="_blank" rel="noopener noreferrer" className="avatar-link" aria-label="GitHub">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                </a>
              )}
              {heroAvatar.linkedin && (
                <a href={heroAvatar.linkedin} target="_blank" rel="noopener noreferrer" className="avatar-link" aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              )}
              {heroAvatar.email && (
                <a href={`mailto:${heroAvatar.email}`} className="avatar-link" aria-label="Email">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story reveal" data-index={0}>
        <div className={`story-inner ${visibleElements.has(0) ? 'visible' : ''}`}>
          <h2>My Story</h2>
          <div dangerouslySetInnerHTML={{ __html: storyHtml }} />
        </div>
      </section>

      {/* Why I Built This Platform Section */}
      <section className="why-platform reveal" data-index={1}>
        <div className={`why-platform-inner ${visibleElements.has(1) ? 'visible' : ''}`}>
          <h2>Why I Built This Platform</h2>
          <div dangerouslySetInnerHTML={{ __html: whyPlatformHtml }} />
        </div>
      </section>

      {/* Engineering Philosophy */}
      <section className="philosophy reveal" data-index={2}>
        <div className={`philosophy-inner ${visibleElements.has(2) ? 'visible' : ''}`}>
          <div className="philosophy-header">
            <div className="overline">{philosophy.overline}</div>
            <h2>{philosophy.heading}</h2>
            <p>{philosophy.subtitle}</p>
          </div>

          <div className="philosophy-grid stagger-children">
            {philosophy.cards.map((card, i) => (
              <div key={i} className="philosophy-card">
                <div className="philosophy-card-num">{String(i + 1).padStart(2, "0")}</div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Expertise */}
      <section className="tech-expertise reveal" data-index={3}>
        <div className={`tech-expertise-inner ${visibleElements.has(3) ? 'visible' : ''}`}>
          <div className="tech-header">
            <div className="overline">{techStack.overline}</div>
            <h2>{techStack.heading}</h2>
            <p>{techStack.subtitle}</p>
          </div>

          <div className="tech-grid stagger-children">
            {techStack.categories.map((category, catIdx) => (
              <div key={catIdx} className="tech-category">
                <h3>{category.name}</h3>
                <div className="tech-items">
                  {category.techs.map((techName, techIdx) => (
                    <div key={techIdx} className="tech-item">
                      <span className="tech-name">{techName}</span>
                      <div className="tech-bar">
                        <div className="tech-bar-fill" style={{ width: `${techProficiency.get(techName) ?? 15}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials reveal" data-index={4}>
        <div className={`testimonials-inner ${visibleElements.has(4) ? 'visible' : ''}`}>
          <div className="testimonials-header">
            <div className="overline">Testimonials</div>
            <h2>What People Say</h2>
            <p>Feedback from clients and colleagues I have worked with over the years.</p>
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
              {testimonials.slice(0, 3).map((testimonial) => (
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
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta reveal" data-index={5}>
        <div className={`about-cta-inner ${visibleElements.has(5) ? 'visible' : ''}`}>
          <div className="cta-card">
            <div className="cta-content">
              <h2>Let's Build Something Together</h2>
              <p>Have a project in mind? Submit a requirement and I will get back to you within 24 hours with a plan of action.</p>
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
