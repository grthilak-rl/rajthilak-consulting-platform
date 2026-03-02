import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ApiError,
  fetchMyRequirement,
  fetchMyNotes,
  submitClientTestimonial,
  setToken,
} from "../api/client";
import type { Requirement, Note, ClientTestimonialPayload } from "../types";
import "./ClientRequirementDetail.css";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  accepted: "Accepted",
  in_progress: "In Progress",
  completed: "Completed",
  rejected: "Rejected",
};

const TYPE_LABELS: Record<string, string> = {
  full_time: "Full-Time",
  contract: "Contract",
  one_off: "One-Off",
};

export default function ClientRequirementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Testimonial form state
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState(0);
  const [feedbackRole, setFeedbackRole] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    Promise.all([fetchMyRequirement(id), fetchMyNotes(id)])
      .then(([req, notesList]) => {
        setRequirement(req);
        setNotes(notesList);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setToken(null);
          navigate("/admin/login");
          return;
        }
        setLoadError((err as Error).message);
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    setFeedbackError("");

    if (!feedbackContent.trim()) {
      setFeedbackError("Please write your feedback before submitting.");
      return;
    }
    if (feedbackRating === 0) {
      setFeedbackError("Please select a star rating.");
      return;
    }

    setSubmittingFeedback(true);
    try {
      const payload: ClientTestimonialPayload = {
        content: feedbackContent.trim(),
        rating: feedbackRating,
        ...(feedbackRole.trim() ? { author_role: feedbackRole.trim() } : {}),
      };
      await submitClientTestimonial(id, payload);
      setFeedbackSuccess(true);
    } catch (err) {
      setFeedbackError((err as Error).message);
    } finally {
      setSubmittingFeedback(false);
    }
  }

  if (loading) {
    return (
      <div className="client-req-detail">
        <div className="client-req-detail-inner">
          <div className="client-req-skeleton">
            <div className="skel-block skel-title" />
            <div className="skel-card">
              <div className="skel-block" style={{ width: "80%" }} />
              <div className="skel-block" style={{ width: "60%" }} />
              <div className="skel-block" style={{ width: "70%" }} />
              <div className="skel-block" style={{ width: "50%" }} />
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

  if (loadError) {
    return (
      <div className="client-req-detail">
        <div className="client-req-detail-inner">
          <div className="client-req-error">
            <p>{loadError}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="client-req-detail">
        <div className="client-req-detail-inner">
          <div className="client-req-empty">
            <h3>Project not found</h3>
            <p>This project may no longer be available.</p>
          </div>
        </div>
      </div>
    );
  }

  const displayRating = feedbackHoverRating || feedbackRating;

  return (
    <div className="client-req-detail">
      <div className="client-req-detail-inner">
        {/* Header */}
        <div className="client-req-detail-header">
          <button className="btn-back" onClick={() => navigate("/portal")}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Projects
          </button>
          <div className="client-req-title-row">
            <h1>{requirement.title}</h1>
            <div className="client-req-meta">
              <span className={`status-badge status-${requirement.status}`}>
                {STATUS_LABELS[requirement.status]}
              </span>
              <span className="type-badge">{TYPE_LABELS[requirement.type]}</span>
            </div>
          </div>
        </div>

        {/* Progress banner */}
        <div className="client-req-progress-card">
          <div className="client-req-progress-header">
            <span className="client-req-progress-label">Project Progress</span>
            <span className="client-req-progress-value">{requirement.progress}%</span>
          </div>
          <div className="client-req-progress-bar-wrap">
            <div
              className="client-req-progress-bar-fill"
              style={{ width: `${requirement.progress}%` }}
            />
          </div>
        </div>

        {/* Details Card */}
        <div className="client-req-info-card">
          <h2>Project Details</h2>
          <div className="req-info-grid">
            <div className="req-info-item full-width">
              <span className="req-info-label">Description</span>
              <span className="req-info-value">{requirement.description}</span>
            </div>
            {requirement.company && (
              <div className="req-info-item">
                <span className="req-info-label">Company</span>
                <span className="req-info-value">{requirement.company}</span>
              </div>
            )}
            <div className="req-info-item">
              <span className="req-info-label">Type</span>
              <span className="req-info-value">{TYPE_LABELS[requirement.type]}</span>
            </div>
            <div className="req-info-item">
              <span className="req-info-label">Tech Stack</span>
              <span className="req-info-value">
                {requirement.tech_stack || <span className="req-info-empty">Not specified</span>}
              </span>
            </div>
            <div className="req-info-item">
              <span className="req-info-label">Timeline</span>
              <span className="req-info-value">
                {requirement.timeline || <span className="req-info-empty">Not specified</span>}
              </span>
            </div>
          </div>

          <div className="req-timestamps">
            <div className="req-info-item">
              <span className="req-info-label">Submitted</span>
              <span className="req-info-value">{new Date(requirement.created_at).toLocaleString()}</span>
            </div>
            <div className="req-info-item">
              <span className="req-info-label">Last Updated</span>
              <span className="req-info-value">{new Date(requirement.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Notes from admin */}
        <div className="client-req-notes-card">
          <h2>Updates from Team</h2>
          {notes.length === 0 ? (
            <div className="client-notes-empty">
              No updates yet. We will post notes here as your project progresses.
            </div>
          ) : (
            <div className="client-notes-list">
              {notes.map((note) => (
                <div className="client-note-item" key={note.id}>
                  <p>{note.content}</p>
                  <span className="note-time">
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback section — only when completed */}
        {requirement.status === "completed" && (
          <div className="client-req-feedback-card">
            <h2>Submit Feedback</h2>

            {feedbackSuccess ? (
              <div className="feedback-success">
                <div className="feedback-success-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>Thank you for your feedback!</h3>
                <p>It will appear on our site after review.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit}>
                {feedbackError && (
                  <div className="alert-error">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {feedbackError}
                  </div>
                )}

                <div className="feedback-form-group">
                  <label className="feedback-label">Your Rating</label>
                  <div
                    className="star-rating"
                    onMouseLeave={() => setFeedbackHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn${displayRating >= star ? " star-active" : ""}`}
                        onClick={() => setFeedbackRating(star)}
                        onMouseEnter={() => setFeedbackHoverRating(star)}
                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill={displayRating >= star ? "currentColor" : "none"}
                          />
                        </svg>
                      </button>
                    ))}
                    {feedbackRating > 0 && (
                      <span className="star-label">
                        {feedbackRating === 1 && "Poor"}
                        {feedbackRating === 2 && "Fair"}
                        {feedbackRating === 3 && "Good"}
                        {feedbackRating === 4 && "Great"}
                        {feedbackRating === 5 && "Excellent"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="feedback-form-group">
                  <label className="feedback-label" htmlFor="feedback-content">Your Feedback</label>
                  <textarea
                    id="feedback-content"
                    className="feedback-textarea"
                    rows={4}
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    placeholder="Share your experience working with us on this project…"
                    required
                  />
                </div>

                <div className="feedback-form-group">
                  <label className="feedback-label" htmlFor="feedback-role">
                    Your Role / Title <span className="feedback-optional">(optional)</span>
                  </label>
                  <input
                    id="feedback-role"
                    className="feedback-input"
                    type="text"
                    value={feedbackRole}
                    onChange={(e) => setFeedbackRole(e.target.value)}
                    placeholder="e.g. CTO at Acme Inc."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-submit-feedback"
                  disabled={submittingFeedback}
                >
                  {submittingFeedback ? "Submitting…" : "Submit Feedback"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
