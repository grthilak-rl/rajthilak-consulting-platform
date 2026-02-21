import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ApiError,
  createSiteContent,
  updateSiteContent,
  fetchSiteContentAdmin,
  setToken,
} from "../api/client";
import type { SiteContentFormData } from "../types";
import "./SiteContentForm.css";

interface AboutHeroMeta {
  overline: string;
  heading: string;
  stats: { value: number; suffix: string; label: string }[];
  avatar: { initials: string; name: string; title: string };
}

const DEFAULT_HERO_META: AboutHeroMeta = {
  overline: "About Me",
  heading: 'Building <span class="highlight">Scalable Systems</span> That Ship',
  stats: [
    { value: 10, suffix: "+", label: "Years Experience" },
    { value: 20, suffix: "+", label: "Projects Delivered" },
    { value: 4, suffix: "", label: "Industries" },
  ],
  avatar: { initials: "RT", name: "Raj Thilak", title: "Engineering Consultant & Architect" },
};

interface PhilosophyCard {
  title: string;
  description: string;
}

interface PhilosophyMeta {
  overline: string;
  heading: string;
  cards: PhilosophyCard[];
}

const DEFAULT_PHILOSOPHY_META: PhilosophyMeta = {
  overline: "Engineering Philosophy",
  heading: "How I Approach Engineering",
  cards: [
    { title: "Ship Early, Iterate Fast", description: "" },
    { title: "Boring Tech Over Hype", description: "" },
    { title: "Design for Observability", description: "" },
    { title: "Write Code People Can Read", description: "" },
  ],
};

export default function SiteContentForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== "new";

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [key, setKey] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [heroMeta, setHeroMeta] = useState<AboutHeroMeta>({ ...DEFAULT_HERO_META });
  const [philosMeta, setPhilosMeta] = useState<PhilosophyMeta>({ ...DEFAULT_PHILOSOPHY_META });

  const isAboutHero = key === "about_hero";
  const isPhilosophy = key === "about_philosophy";
  const isHtmlContent = key === "about_story" || key === "about_why_platform";

  useEffect(() => {
    if (!isEditMode || !id) return;

    fetchSiteContentAdmin()
      .then((items) => {
        const item = items.find((i) => i.id === id);
        if (!item) {
          setError("Content not found");
          return;
        }
        setKey(item.key);
        setTitle(item.title || "");
        setContent(item.content);

        if (item.key === "about_hero" && item.metadata) {
          const m = item.metadata as unknown as AboutHeroMeta;
          setHeroMeta({
            overline: m.overline || DEFAULT_HERO_META.overline,
            heading: m.heading || DEFAULT_HERO_META.heading,
            stats: m.stats?.length ? m.stats : DEFAULT_HERO_META.stats,
            avatar: m.avatar || DEFAULT_HERO_META.avatar,
          });
        }

        if (item.key === "about_philosophy" && item.metadata) {
          const m = item.metadata as unknown as PhilosophyMeta;
          setPhilosMeta({
            overline: m.overline || DEFAULT_PHILOSOPHY_META.overline,
            heading: m.heading || DEFAULT_PHILOSOPHY_META.heading,
            cards: m.cards?.length ? m.cards : DEFAULT_PHILOSOPHY_META.cards,
          });
        }
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setToken(null);
          navigate("/admin/login");
          return;
        }
        setError((err as Error).message);
      })
      .finally(() => setLoading(false));
  }, [id, isEditMode, navigate]);

  function updateStat(index: number, field: keyof AboutHeroMeta["stats"][0], value: string | number) {
    setHeroMeta((prev) => ({
      ...prev,
      stats: prev.stats.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload: SiteContentFormData = {
      key,
      title: title || undefined,
      content,
      metadata: isAboutHero
        ? (heroMeta as unknown as Record<string, unknown>)
        : isPhilosophy
          ? (philosMeta as unknown as Record<string, unknown>)
          : undefined,
    };

    try {
      if (isEditMode && id) {
        await updateSiteContent(id, payload);
      } else {
        await createSiteContent(payload);
      }
      navigate("/admin/site");
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setToken(null);
        navigate("/admin/login");
        return;
      }
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="cs-form-page">
        <div className="cs-form-inner">
          <div className="cs-form-skeleton">
            <div className="skel-block skel-title" />
            <div className="skel-card">
              <div className="skel-block" style={{ width: "80%" }} />
              <div className="skel-block" style={{ width: "60%" }} />
              <div className="skel-block" style={{ width: "70%" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-form-page">
      <div className="cs-form-inner">
        {/* Header */}
        <div className="cs-form-header">
          <Link to="/admin/site" className="btn-back-dash" style={{ marginBottom: 16 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Site Content
          </Link>
          <h1>{isEditMode ? "Edit Content" : "New Content"}</h1>
        </div>

        {error && (
          <div className="alert-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        <form className="cs-form" onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="cs-form-section">
            <h2>Basic Information</h2>
            <div className="cs-form-grid">
              <div className="cs-form-field">
                <label htmlFor="sc-key">Key</label>
                <input
                  id="sc-key"
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="about_hero"
                  required
                  disabled={isEditMode}
                />
                <span className="field-hint">Unique identifier (lowercase, underscores)</span>
              </div>
              <div className="cs-form-field">
                <label htmlFor="sc-title">Title</label>
                <input
                  id="sc-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Display title"
                />
              </div>
              <div className="cs-form-field full-width">
                <label htmlFor="sc-content">Content</label>
                <textarea
                  id="sc-content"
                  rows={isHtmlContent ? 12 : 4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Main content text…"
                  required
                />
                {isAboutHero && (
                  <span className="field-hint">This is the lead paragraph displayed below the heading.</span>
                )}
                {isPhilosophy && (
                  <span className="field-hint">This is the subtitle displayed below the section heading.</span>
                )}
                {isHtmlContent && (
                  <span className="field-hint">
                    HTML supported. Use &lt;p&gt; for paragraphs, &lt;strong&gt; for bold, &lt;hr&gt; for dividers.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* About Hero — Structured Fields */}
          {isAboutHero && (
            <>
              <div className="cs-form-section">
                <h2>Hero Display</h2>
                <div className="cs-form-grid">
                  <div className="cs-form-field">
                    <label htmlFor="hero-overline">Overline</label>
                    <input
                      id="hero-overline"
                      type="text"
                      value={heroMeta.overline}
                      onChange={(e) => setHeroMeta((p) => ({ ...p, overline: e.target.value }))}
                      placeholder="About Me"
                    />
                  </div>
                  <div className="cs-form-field full-width">
                    <label htmlFor="hero-heading">Heading</label>
                    <input
                      id="hero-heading"
                      type="text"
                      value={heroMeta.heading}
                      onChange={(e) => setHeroMeta((p) => ({ ...p, heading: e.target.value }))}
                      placeholder='Building <span class="highlight">Scalable Systems</span> That Ship'
                    />
                    <span className="field-hint">
                      Use &lt;span class="highlight"&gt;…&lt;/span&gt; for accent-colored text.
                    </span>
                  </div>
                </div>
              </div>

              <div className="cs-form-section">
                <h2>Stats</h2>
                <div className="sc-stats-grid">
                  {heroMeta.stats.map((stat, i) => (
                    <div key={i} className="sc-stat-row">
                      <div className="cs-form-field">
                        <label>Value</label>
                        <input
                          type="number"
                          value={stat.value}
                          onChange={(e) => updateStat(i, "value", parseInt(e.target.value, 10) || 0)}
                        />
                      </div>
                      <div className="cs-form-field">
                        <label>Suffix</label>
                        <input
                          type="text"
                          value={stat.suffix}
                          onChange={(e) => updateStat(i, "suffix", e.target.value)}
                          placeholder="+"
                        />
                      </div>
                      <div className="cs-form-field" style={{ flex: 2 }}>
                        <label>Label</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => updateStat(i, "label", e.target.value)}
                          placeholder="Years Experience"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cs-form-section">
                <h2>Avatar Card</h2>
                <div className="cs-form-grid">
                  <div className="cs-form-field">
                    <label htmlFor="avatar-initials">Initials</label>
                    <input
                      id="avatar-initials"
                      type="text"
                      value={heroMeta.avatar.initials}
                      onChange={(e) =>
                        setHeroMeta((p) => ({ ...p, avatar: { ...p.avatar, initials: e.target.value } }))
                      }
                      placeholder="RT"
                      maxLength={3}
                    />
                  </div>
                  <div className="cs-form-field">
                    <label htmlFor="avatar-name">Name</label>
                    <input
                      id="avatar-name"
                      type="text"
                      value={heroMeta.avatar.name}
                      onChange={(e) =>
                        setHeroMeta((p) => ({ ...p, avatar: { ...p.avatar, name: e.target.value } }))
                      }
                      placeholder="Raj Thilak"
                    />
                  </div>
                  <div className="cs-form-field full-width">
                    <label htmlFor="avatar-title">Title</label>
                    <input
                      id="avatar-title"
                      type="text"
                      value={heroMeta.avatar.title}
                      onChange={(e) =>
                        setHeroMeta((p) => ({ ...p, avatar: { ...p.avatar, title: e.target.value } }))
                      }
                      placeholder="Engineering Consultant & Architect"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Philosophy — Structured Fields */}
          {isPhilosophy && (
            <>
              <div className="cs-form-section">
                <h2>Section Display</h2>
                <div className="cs-form-grid">
                  <div className="cs-form-field">
                    <label htmlFor="phil-overline">Overline</label>
                    <input
                      id="phil-overline"
                      type="text"
                      value={philosMeta.overline}
                      onChange={(e) => setPhilosMeta((p) => ({ ...p, overline: e.target.value }))}
                      placeholder="Engineering Philosophy"
                    />
                  </div>
                  <div className="cs-form-field">
                    <label htmlFor="phil-heading">Heading</label>
                    <input
                      id="phil-heading"
                      type="text"
                      value={philosMeta.heading}
                      onChange={(e) => setPhilosMeta((p) => ({ ...p, heading: e.target.value }))}
                      placeholder="How I Approach Engineering"
                    />
                  </div>
                </div>
              </div>

              <div className="cs-form-section">
                <h2>Philosophy Cards</h2>
                <div className="sc-cards-grid">
                  {philosMeta.cards.map((card, i) => (
                    <div key={i} className="sc-card-editor">
                      <div className="sc-card-num">{String(i + 1).padStart(2, "0")}</div>
                      <div className="cs-form-field">
                        <label>Title</label>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) =>
                            setPhilosMeta((p) => ({
                              ...p,
                              cards: p.cards.map((c, ci) =>
                                ci === i ? { ...c, title: e.target.value } : c
                              ),
                            }))
                          }
                          placeholder="Card title"
                        />
                      </div>
                      <div className="cs-form-field">
                        <label>Description</label>
                        <textarea
                          rows={3}
                          value={card.description}
                          onChange={(e) =>
                            setPhilosMeta((p) => ({
                              ...p,
                              cards: p.cards.map((c, ci) =>
                                ci === i ? { ...c, description: e.target.value } : c
                              ),
                            }))
                          }
                          placeholder="Card description…"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="cs-form-actions">
            <Link to="/admin/site" className="btn-cancel">Cancel</Link>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? "Saving…" : isEditMode ? "Update Content" : "Create Content"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
