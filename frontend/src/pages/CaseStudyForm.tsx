import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ApiError,
  createCaseStudy,
  updateCaseStudy,
  fetchCaseStudyAdmin,
  uploadFile,
  setToken,
} from "../api/client";
import type { CaseStudyFormData, GalleryItem } from "../types";
import "./CaseStudyForm.css";

const TECH_CATEGORIES = [
  "Language", "Framework", "Infrastructure", "Data & Messaging", "AI & ML", "Tools",
];

const ICON_OPTIONS = [
  "code", "microphone", "activity", "bar-chart", "cloud",
  "briefcase", "cpu", "database", "rocket", "shield",
];

const COLOR_OPTIONS = [
  "primary", "ai", "healthcare", "telecom", "fintech",
  "success", "accent",
];

const EMPTY_FORM: CaseStudyFormData = {
  slug: "",
  title: "",
  role: "",
  description: "",
  industry: "",
  technologies: [],
  featured: false,
  metrics: [],
  problem: "",
  solution: "",
  role_description: "",
  key_features: [],
  architecture: "",
  challenges: "",
  impact: "",
  gallery: [],
  visual_color: "primary",
  visual_icon: "code",
  display_order: 0,
  is_active: true,
};

export default function CaseStudyForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== "new";

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<CaseStudyFormData>({ ...EMPTY_FORM });

  // Temp inputs for array fields
  const [techInput, setTechInput] = useState("");
  const [techCategory, setTechCategory] = useState<string>("Language");
  const [metricValue, setMetricValue] = useState("");
  const [metricLabel, setMetricLabel] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [galleryCaption, setGalleryCaption] = useState("");
  const [galleryType, setGalleryType] = useState<GalleryItem["type"]>("screenshot");
  const [galleryUploading, setGalleryUploading] = useState(false);

  useEffect(() => {
    if (!isEditMode || !id) return;

    fetchCaseStudyAdmin(id)
      .then((cs) => {
        setFormData({
          slug: cs.slug,
          title: cs.title,
          role: cs.role,
          description: cs.description,
          industry: cs.industry,
          technologies: cs.technologies,
          featured: cs.featured,
          metrics: cs.metrics || [],
          problem: cs.problem || "",
          solution: cs.solution || "",
          role_description: cs.role_description || "",
          key_features: cs.key_features || [],
          architecture: cs.architecture || "",
          challenges: cs.challenges || "",
          impact: cs.impact || "",
          gallery: cs.gallery || [],
          visual_color: cs.visual.color,
          visual_icon: cs.visual.icon,
          display_order: cs.display_order,
          is_active: cs.is_active,
        });
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

  function handleChange(field: keyof CaseStudyFormData, value: unknown) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function addTechnology() {
    const tech = techInput.trim();
    if (!tech) return;
    if (formData.technologies.some((t) => t.name === tech)) { setTechInput(""); return; }
    setFormData((prev) => ({ ...prev, technologies: [...prev.technologies, { name: tech, category: techCategory }] }));
    setTechInput("");
  }

  function removeTechnology(index: number) {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index),
    }));
  }

  function addMetric() {
    if (!metricValue.trim() || !metricLabel.trim()) return;
    setFormData((prev) => ({
      ...prev,
      metrics: [...prev.metrics, { value: metricValue.trim(), label: metricLabel.trim() }],
    }));
    setMetricValue("");
    setMetricLabel("");
  }

  function removeMetric(index: number) {
    setFormData((prev) => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== index),
    }));
  }

  function addFeature() {
    const feature = featureInput.trim();
    if (!feature) return;
    if (formData.key_features.includes(feature)) { setFeatureInput(""); return; }
    setFormData((prev) => ({ ...prev, key_features: [...prev.key_features, feature] }));
    setFeatureInput("");
  }

  function removeFeature(index: number) {
    setFormData((prev) => ({
      ...prev,
      key_features: prev.key_features.filter((_, i) => i !== index),
    }));
  }

  async function handleGalleryFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setGalleryUploading(true);
    try {
      const { url } = await uploadFile(file);
      setFormData((prev) => ({
        ...prev,
        gallery: [...prev.gallery, { url, caption: galleryCaption.trim(), type: galleryType }],
      }));
      setGalleryCaption("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGalleryUploading(false);
      e.target.value = "";
    }
  }

  function removeGalleryItem(index: number) {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Send null for empty rich content fields so the backend stores NULL
    const payload = {
      ...formData,
      metrics: formData.metrics.length > 0 ? formData.metrics : [],
      problem: formData.problem || null,
      solution: formData.solution || null,
      role_description: formData.role_description || null,
      key_features: formData.key_features.length > 0 ? formData.key_features : null,
      architecture: formData.architecture || null,
      challenges: formData.challenges || null,
      impact: formData.impact || null,
      gallery: formData.gallery.length > 0 ? formData.gallery : null,
    } as unknown as CaseStudyFormData;

    try {
      if (isEditMode && id) {
        await updateCaseStudy(id, payload);
      } else {
        await createCaseStudy(payload);
      }
      navigate("/admin/portfolio");
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
            <div className="skel-card">
              <div className="skel-block" style={{ width: "40%" }} />
              <div className="skel-block" style={{ width: "100%" }} />
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
          <Link to="/admin/portfolio" className="btn-back-dash" style={{ marginBottom: 16 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Portfolio
          </Link>
          <h1>{isEditMode ? "Edit Project" : "New Project"}</h1>
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
                <label htmlFor="slug">Slug</label>
                <input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="my-case-study"
                  required
                />
                <span className="field-hint">URL-friendly identifier (lowercase, hyphens)</span>
              </div>
              <div className="cs-form-field">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Project Title"
                  required
                />
              </div>
              <div className="cs-form-field">
                <label htmlFor="role">Role</label>
                <input
                  id="role"
                  type="text"
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  placeholder="Lead Engineer"
                  required
                />
              </div>
              <div className="cs-form-field">
                <label htmlFor="industry">Industry</label>
                <input
                  id="industry"
                  type="text"
                  value={formData.industry}
                  onChange={(e) => handleChange("industry", e.target.value)}
                  placeholder="Fintech"
                  required
                />
              </div>
              <div className="cs-form-field full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe the project, challenges, and outcomes…"
                  required
                />
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div className="cs-form-section">
            <h2>Technologies</h2>
            <div className="cs-form-field">
              <label>Add Technology</label>
              <div className="tag-input-row">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addTechnology(); }
                  }}
                  placeholder="React, Python, AWS…"
                />
                <select
                  className="tech-category-select"
                  value={techCategory}
                  onChange={(e) => setTechCategory(e.target.value)}
                >
                  {TECH_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button type="button" className="btn-add-tag" onClick={addTechnology}>
                  Add
                </button>
              </div>
              {formData.technologies.length > 0 && (
                <div className="tag-list">
                  {formData.technologies.map((tech, i) => (
                    <span key={i} className="tag">
                      {tech.name}
                      <span className="tag-category">{tech.category}</span>
                      <button type="button" onClick={() => removeTechnology(i)}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="cs-form-section">
            <h2>Metrics (Optional)</h2>
            <div className="cs-form-field">
              <label>Add Metric</label>
              <div className="metric-input-row">
                <input
                  type="text"
                  value={metricValue}
                  onChange={(e) => setMetricValue(e.target.value)}
                  placeholder="60%"
                />
                <input
                  type="text"
                  value={metricLabel}
                  onChange={(e) => setMetricLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addMetric(); }
                  }}
                  placeholder="Faster Response Time"
                />
                <button type="button" className="btn-add-metric" onClick={addMetric}>
                  Add
                </button>
              </div>
              {formData.metrics.length > 0 && (
                <div className="metric-list">
                  {formData.metrics.map((m, i) => (
                    <div key={i} className="metric-item">
                      <span className="metric-value">{m.value}</span>
                      <span className="metric-label">{m.label}</span>
                      <button type="button" onClick={() => removeMetric(i)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Case Study Narrative */}
          <div className="cs-form-section">
            <h2>Case Study Narrative</h2>
            <div className="cs-form-grid">
              <div className="cs-form-field full-width">
                <label htmlFor="problem">Problem</label>
                <textarea
                  id="problem"
                  rows={8}
                  value={formData.problem}
                  onChange={(e) => handleChange("problem", e.target.value)}
                  placeholder="What was broken or missing? Describe the challenge..."
                />
                <span className="field-hint">HTML supported: &lt;p&gt;, &lt;ul&gt;/&lt;ol&gt;/&lt;li&gt;, &lt;strong&gt;, &lt;hr&gt;</span>
              </div>
              <div className="cs-form-field full-width">
                <label htmlFor="solution">Solution</label>
                <textarea
                  id="solution"
                  rows={8}
                  value={formData.solution}
                  onChange={(e) => handleChange("solution", e.target.value)}
                  placeholder="What was built and how it works..."
                />
                <span className="field-hint">HTML supported: &lt;p&gt;, &lt;ul&gt;/&lt;ol&gt;/&lt;li&gt;, &lt;strong&gt;, &lt;hr&gt;</span>
              </div>
              <div className="cs-form-field full-width">
                <label htmlFor="role_description">My Role (Detailed)</label>
                <textarea
                  id="role_description"
                  rows={8}
                  value={formData.role_description}
                  onChange={(e) => handleChange("role_description", e.target.value)}
                  placeholder="Ownership areas and responsibilities..."
                />
                <span className="field-hint">HTML supported: &lt;p&gt;, &lt;ul&gt;/&lt;ol&gt;/&lt;li&gt;, &lt;strong&gt;, &lt;hr&gt;</span>
              </div>
              <div className="cs-form-field full-width">
                <label htmlFor="challenges">Challenges &amp; Trade-offs</label>
                <textarea
                  id="challenges"
                  rows={8}
                  value={formData.challenges}
                  onChange={(e) => handleChange("challenges", e.target.value)}
                  placeholder="Real engineering problems and how they were solved..."
                />
                <span className="field-hint">HTML supported: &lt;p&gt;, &lt;ul&gt;/&lt;ol&gt;/&lt;li&gt;, &lt;strong&gt;, &lt;hr&gt;</span>
              </div>
              <div className="cs-form-field full-width">
                <label htmlFor="impact">Impact</label>
                <textarea
                  id="impact"
                  rows={8}
                  value={formData.impact}
                  onChange={(e) => handleChange("impact", e.target.value)}
                  placeholder="Why this mattered — qualitative narrative..."
                />
                <span className="field-hint">HTML supported: &lt;p&gt;, &lt;ul&gt;/&lt;ol&gt;/&lt;li&gt;, &lt;strong&gt;, &lt;hr&gt;</span>
              </div>
            </div>
          </div>

          {/* Key Features & Architecture */}
          <div className="cs-form-section">
            <h2>Key Features &amp; Architecture</h2>
            <div className="cs-form-field">
              <label>Key Features</label>
              <div className="tag-input-row">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                  placeholder="Add a feature..."
                />
                <button type="button" className="btn-add-tag" onClick={addFeature}>Add</button>
              </div>
              {formData.key_features.length > 0 && (
                <div className="feature-list">
                  {formData.key_features.map((f, i) => (
                    <div key={i} className="feature-item">
                      <span>{f}</span>
                      <button type="button" onClick={() => removeFeature(i)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="cs-form-field" style={{ marginTop: "var(--space-5)" }}>
              <label htmlFor="architecture">Architecture</label>
              <textarea
                id="architecture"
                rows={8}
                value={formData.architecture}
                onChange={(e) => handleChange("architecture", e.target.value)}
                placeholder="Describe the system architecture, components, data flow..."
              />
              <span className="field-hint">HTML supported: &lt;p&gt;, &lt;ul&gt;/&lt;ol&gt;/&lt;li&gt;, &lt;strong&gt;, &lt;hr&gt;</span>
            </div>
          </div>

          {/* Screenshot Gallery */}
          <div className="cs-form-section">
            <h2>Screenshot Gallery</h2>
            <div className="cs-form-field">
              <label>Add Image</label>
              <div className="gallery-input-row">
                <input
                  type="text"
                  value={galleryCaption}
                  onChange={(e) => setGalleryCaption(e.target.value)}
                  placeholder="Caption (optional)"
                />
                <select value={galleryType} onChange={(e) => setGalleryType(e.target.value as GalleryItem["type"])}>
                  <option value="screenshot">Screenshot</option>
                  <option value="architecture">Architecture</option>
                </select>
              </div>
              <label className="gallery-upload-btn" aria-disabled={galleryUploading || saving}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryFileSelect}
                  disabled={galleryUploading || saving}
                  style={{ display: "none" }}
                />
                {galleryUploading ? (
                  <>
                    <span className="upload-spinner" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2v8M4 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Choose File
                  </>
                )}
              </label>
              <span className="field-hint">JPG, PNG, GIF, WebP, or SVG (max 10 MB)</span>
              {formData.gallery.length > 0 && (
                <div className="gallery-list">
                  {formData.gallery.map((item, i) => (
                    <div key={i} className="gallery-item">
                      <img src={item.url} alt={item.caption} className="gallery-thumb" />
                      <div className="gallery-item-info">
                        <span className="gallery-item-caption">{item.caption || "(no caption)"}</span>
                        <span className="gallery-item-type">{item.type}</span>
                      </div>
                      <button type="button" onClick={() => removeGalleryItem(i)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Visual Settings */}
          <div className="cs-form-section">
            <h2>Visual Settings</h2>
            <div className="cs-form-grid">
              <div className="cs-form-field">
                <label>Color Theme</label>
                <div className="color-picker">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option color-${color}${formData.visual_color === color ? " active" : ""}`}
                      onClick={() => handleChange("visual_color", color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <div className="cs-form-field">
                <label htmlFor="visual_icon">Icon</label>
                <select
                  id="visual_icon"
                  value={formData.visual_icon}
                  onChange={(e) => handleChange("visual_icon", e.target.value)}
                >
                  {ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              <div className="cs-form-field">
                <label htmlFor="display_order">Display Order</label>
                <input
                  id="display_order"
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => handleChange("display_order", parseInt(e.target.value, 10) || 0)}
                />
                <span className="field-hint">Lower numbers appear first</span>
              </div>
            </div>
          </div>

          {/* Status Flags */}
          <div className="cs-form-section">
            <h2>Status</h2>
            <div className="cs-form-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => handleChange("featured", e.target.checked)}
                />
                <span>Featured — highlighted on homepage and portfolio page</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleChange("is_active", e.target.checked)}
                />
                <span>Active — visible on the public site</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="cs-form-actions">
            <Link to="/admin/portfolio" className="btn-cancel">Cancel</Link>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? "Saving…" : isEditMode ? "Update Project" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
