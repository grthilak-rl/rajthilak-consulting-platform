import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { submitRequirement } from '../api/client';
import './ContactPage.css';

interface RequirementForm {
  name: string;
  email: string;
  company: string;
  title: string;
  description: string;
  type: 'full_time' | 'contract' | 'one_off';
  tech_stack: string;
  timeline: string;
}

type FormErrors = Partial<Record<keyof RequirementForm, string>>;

const INITIAL_FORM: RequirementForm = {
  name: '',
  email: '',
  company: '',
  title: '',
  description: '',
  type: 'contract',
  tech_stack: '',
  timeline: '',
};

function validateForm(form: RequirementForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Invalid email format';
  }
  if (!form.title.trim()) errors.title = 'Project title is required';
  if (!form.description.trim()) errors.description = 'Description is required';
  if (!form.type) errors.type = 'Engagement type is required';
  return errors;
}

export default function ContactPage() {
  const [form, setForm] = useState<RequirementForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RequirementForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleTypeChange(type: 'full_time' | 'contract' | 'one_off') {
    setForm((prev) => ({ ...prev, type }));
    if (errors.type) {
      setErrors((prev) => ({ ...prev, type: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError('');

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (!form.company.trim()) payload.company = null;
      if (!form.tech_stack.trim()) payload.tech_stack = null;
      if (!form.timeline.trim()) payload.timeline = null;

      await submitRequirement(payload);
      setSuccess(true);
      setForm(INITIAL_FORM);
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <Layout>
        <section className="success-page">
          <div className="success-page-content animate-in">
            <div className="success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h1 className="success-page-title">Thank You!</h1>
            <p className="success-page-subtitle">
              Your requirement has been submitted successfully. I'll review it and get back to you within 24 hours with a plan of action.
            </p>
            <div className="success-steps">
              <div className="success-step">
                <div className="success-step-num">1</div>
                <div>
                  <h4>Reviewing your requirement</h4>
                  <p>I'll go through the details you've shared</p>
                </div>
              </div>
              <div className="success-step">
                <div className="success-step-num">2</div>
                <div>
                  <h4>Proposal within 24 hours</h4>
                  <p>You'll receive a detailed scope and timeline</p>
                </div>
              </div>
              <div className="success-step">
                <div className="success-step-num">3</div>
                <div>
                  <h4>Kickoff call</h4>
                  <p>Once approved, we schedule a call and start building</p>
                </div>
              </div>
            </div>
            <div className="success-actions">
              <button className="btn-primary" onClick={() => setSuccess(false)}>
                Submit Another Requirement
              </button>
              <Link to="/" className="btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Page Header */}
      <section className="page-header">
        <div className="overline animate-in">Get in Touch</div>
        <h1 className="animate-in delay-1">Submit a Requirement</h1>
        <p className="subtitle animate-in delay-2">
          Tell me about your project and I will get back to you within 24 hours with a plan of action.
        </p>
      </section>

      {/* Form Layout */}
      <section className="form-layout">
        {/* Main Form */}
        <div className="form-card">
            <form onSubmit={handleSubmit}>
              {apiError && (
                <div className="alert alert-error">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {apiError}
                </div>
              )}

              {/* Contact Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Contact Information
                </h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Full Name <span className="required">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange}
                    />
                    {errors.name && <div className="form-error show">{errors.name}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="john@company.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="form-error show">{errors.email}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="company" className="form-label">Company (Optional)</label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    className="form-input"
                    placeholder="Acme Inc."
                    value={form.company}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Project Details Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  Project Details
                </h3>

                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Project Title <span className="required">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    className={`form-input ${errors.title ? 'error' : ''}`}
                    placeholder="E.g., Build an AI-powered customer support chatbot"
                    value={form.title}
                    onChange={handleChange}
                  />
                  {errors.title && <div className="form-error show">{errors.title}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className={`form-textarea ${errors.description ? 'error' : ''}`}
                    placeholder="Describe your project requirements, goals, and any specific challenges you are facing..."
                    rows={5}
                    value={form.description}
                    onChange={handleChange}
                  />
                  {errors.description && <div className="form-error show">{errors.description}</div>}
                  <div className="form-hint">Be as detailed as possible to help me understand your needs.</div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Engagement Type <span className="required">*</span>
                  </label>
                  <div className="type-selector">
                    <label className={`type-pill ${form.type === 'full_time' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="type"
                        value="full_time"
                        checked={form.type === 'full_time'}
                        onChange={() => handleTypeChange('full_time')}
                      />
                      <span className="type-pill-dot"></span>
                      <span>Full-Time</span>
                    </label>
                    <label className={`type-pill ${form.type === 'contract' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="type"
                        value="contract"
                        checked={form.type === 'contract'}
                        onChange={() => handleTypeChange('contract')}
                      />
                      <span className="type-pill-dot"></span>
                      <span>Contract</span>
                    </label>
                    <label className={`type-pill ${form.type === 'one_off' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="type"
                        value="one_off"
                        checked={form.type === 'one_off'}
                        onChange={() => handleTypeChange('one_off')}
                      />
                      <span className="type-pill-dot"></span>
                      <span>One-Off</span>
                    </label>
                  </div>
                  {errors.type && <div className="form-error show">{errors.type}</div>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tech_stack" className="form-label">Tech Stack (Optional)</label>
                    <input
                      id="tech_stack"
                      name="tech_stack"
                      type="text"
                      className="form-input"
                      placeholder="E.g., Python, React, PostgreSQL"
                      value={form.tech_stack}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="timeline" className="form-label">Timeline (Optional)</label>
                    <input
                      id="timeline"
                      name="timeline"
                      type="text"
                      className="form-input"
                      placeholder="E.g., 2-3 months"
                      value={form.timeline}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Requirement
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
        </div>

        {/* Sidebar */}
        <aside className="form-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">What Happens Next?</h3>
            <div className="sidebar-steps">
              <div className="sidebar-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Review</h4>
                  <p>I will review your requirement within 24 hours</p>
                </div>
              </div>
              <div className="sidebar-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Proposal</h4>
                  <p>You will receive a detailed proposal with timelines and scope</p>
                </div>
              </div>
              <div className="sidebar-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Kickoff</h4>
                  <p>Once approved, we schedule a kickoff call and start building</p>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">Engagement Types</h3>
            <div className="sidebar-info">
              <div className="info-item">
                <h4>Full-Time</h4>
                <p>Embedded within your team for extended engagements</p>
              </div>
              <div className="info-item">
                <h4>Contract</h4>
                <p>Scoped projects with clear deliverables and timelines</p>
              </div>
              <div className="info-item">
                <h4>One-Off</h4>
                <p>Quick architecture reviews, POCs, or tech advisory</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </Layout>
  );
}
