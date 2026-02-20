import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ApiError,
  fetchRequirement,
  updateStatus,
  updateProgress,
  fetchNotes,
  createNote,
  setToken,
} from "../api/client";
import type { Requirement, Note } from "../types";
import "./RequirementDetail.css";

const STATUSES = ["new", "accepted", "in_progress", "completed", "rejected"];

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

export default function RequirementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const [noteContent, setNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  function handleAuthError(err: unknown): boolean {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      setToken(null);
      navigate("/admin/login");
      return true;
    }
    return false;
  }

  useEffect(() => {
    if (!id) return;

    Promise.all([fetchRequirement(id), fetchNotes(id)])
      .then(([req, notesList]) => {
        setRequirement(req);
        setStatus(req.status);
        setProgress(req.progress);
        setNotes(notesList);
      })
      .catch((err: unknown) => {
        if (!handleAuthError(err)) {
          setLoadError((err as Error).message);
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!id) return;
    const newStatus = e.target.value;
    setStatus(newStatus);
    setSaving(true);
    setActionError("");
    try {
      const updated = await updateStatus(id, newStatus);
      setRequirement(updated);
    } catch (err) {
      if (!handleAuthError(err)) {
        setActionError((err as Error).message);
        if (requirement) setStatus(requirement.status);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleProgressSave() {
    if (!id) return;
    setSaving(true);
    setActionError("");
    try {
      const updated = await updateProgress(id, progress);
      setRequirement(updated);
    } catch (err) {
      if (!handleAuthError(err)) {
        setActionError((err as Error).message);
        if (requirement) setProgress(requirement.progress);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    if (!id) return;
    e.preventDefault();
    if (!noteContent.trim()) return;
    setAddingNote(true);
    setActionError("");
    try {
      const note = await createNote(id, noteContent.trim());
      setNotes((prev) => [note, ...prev]);
      setNoteContent("");
    } catch (err) {
      if (!handleAuthError(err)) {
        setActionError((err as Error).message);
      }
    } finally {
      setAddingNote(false);
    }
  }

  if (loading) {
    return (
      <div className="req-detail">
        <div className="req-detail-inner">
          <div className="req-detail-skeleton">
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
      <div className="req-detail">
        <div className="req-detail-inner">
          <div className="admin-error">
            <p>{loadError}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="req-detail">
        <div className="req-detail-inner">
          <div className="admin-empty">
            <h3>Requirement not found</h3>
            <p>This requirement may have been deleted.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="req-detail">
      <div className="req-detail-inner">
        {/* Header */}
        <div className="req-detail-header">
          <button className="btn-back" onClick={() => navigate("/admin/dashboard")}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <div className="req-detail-title-row">
            <h1>{requirement.title}</h1>
            <div className="req-detail-meta">
              <span className={`status-badge status-${requirement.status}`}>
                {STATUS_LABELS[requirement.status]}
              </span>
              <span className="type-badge">{TYPE_LABELS[requirement.type]}</span>
            </div>
          </div>
        </div>

        {actionError && (
          <div className="alert-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {actionError}
          </div>
        )}

        {/* Info Card */}
        <div className="req-info-card">
          <h2>Requirement Details</h2>
          <div className="req-info-grid">
            <div className="req-info-item">
              <span className="req-info-label">Client Name</span>
              <span className="req-info-value">{requirement.name}</span>
            </div>
            <div className="req-info-item">
              <span className="req-info-label">Email</span>
              <span className="req-info-value">
                <a href={`mailto:${requirement.email}`}>{requirement.email}</a>
              </span>
            </div>
            <div className="req-info-item">
              <span className="req-info-label">Company</span>
              <span className="req-info-value">
                {requirement.company || <span className="req-info-empty">Not specified</span>}
              </span>
            </div>
            <div className="req-info-item">
              <span className="req-info-label">Type</span>
              <span className="req-info-value">{TYPE_LABELS[requirement.type]}</span>
            </div>
            <div className="req-info-item full-width">
              <span className="req-info-label">Description</span>
              <span className="req-info-value">{requirement.description}</span>
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
              <span className="req-info-label">Created</span>
              <span className="req-info-value">{new Date(requirement.created_at).toLocaleString()}</span>
            </div>
            <div className="req-info-item">
              <span className="req-info-label">Updated</span>
              <span className="req-info-value">{new Date(requirement.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Controls Card */}
        <div className="req-controls-card">
          <h2>Manage</h2>
          <div className="req-controls-grid">
            <div className="req-control-group">
              <span className="req-control-label">Status</span>
              <select value={status} onChange={handleStatusChange} disabled={saving}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            <div className="req-control-group">
              <span className="req-control-label">Progress</span>
              <div className="progress-row">
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <input
                  className="progress-input"
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  disabled={saving}
                />
                <span className="progress-pct">%</span>
                <button className="btn-save-progress" onClick={handleProgressSave} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Card */}
        <div className="req-notes-card">
          <h2>Notes</h2>

          <form className="note-form" onSubmit={handleAddNote}>
            <textarea
              rows={3}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add a note about this requirement…"
            />
            <button
              type="submit"
              className="btn-add-note"
              disabled={addingNote || !noteContent.trim()}
            >
              {addingNote ? "Adding…" : "Add Note"}
            </button>
          </form>

          {notes.length === 0 ? (
            <div className="notes-empty">No notes yet. Add one above.</div>
          ) : (
            <div className="notes-list">
              {notes.map((note) => (
                <div className="note-item" key={note.id}>
                  <p>{note.content}</p>
                  <span className="note-time">
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
