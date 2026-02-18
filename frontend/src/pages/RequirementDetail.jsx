import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchRequirement,
  updateStatus,
  updateProgress,
  fetchNotes,
  createNote,
  setToken,
} from "../api/client";

const STATUSES = ["new", "accepted", "in_progress", "completed", "rejected"];

export default function RequirementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const [noteContent, setNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  function handleAuthError(err) {
    if (err.status === 401 || err.status === 403) {
      setToken(null);
      navigate("/admin/login");
      return true;
    }
    return false;
  }

  useEffect(() => {
    Promise.all([fetchRequirement(id), fetchNotes(id)])
      .then(([req, notesList]) => {
        setRequirement(req);
        setStatus(req.status);
        setProgress(req.progress);
        setNotes(notesList);
      })
      .catch((err) => {
        if (!handleAuthError(err)) {
          setLoadError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleStatusChange(e) {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setSaving(true);
    setActionError("");
    try {
      const updated = await updateStatus(id, newStatus);
      setRequirement(updated);
    } catch (err) {
      if (!handleAuthError(err)) {
        setActionError(err.message);
        setStatus(requirement.status);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleProgressSave() {
    setSaving(true);
    setActionError("");
    try {
      const updated = await updateProgress(id, progress);
      setRequirement(updated);
    } catch (err) {
      if (!handleAuthError(err)) {
        setActionError(err.message);
        setProgress(requirement.progress);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote(e) {
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
        setActionError(err.message);
      }
    } finally {
      setAddingNote(false);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (loadError) return <p style={{ color: "red" }}>{loadError}</p>;
  if (!requirement) return <p>Requirement not found.</p>;

  return (
    <div>
      <button onClick={() => navigate("/admin/dashboard")}>
        Back to Dashboard
      </button>

      <h1>{requirement.title}</h1>
      {actionError && <p style={{ color: "red" }}>{actionError}</p>}

      <table border="1" cellPadding="8" cellSpacing="0">
        <tbody>
          <tr>
            <th>Name</th>
            <td>{requirement.name}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{requirement.email}</td>
          </tr>
          <tr>
            <th>Company</th>
            <td>{requirement.company || "-"}</td>
          </tr>
          <tr>
            <th>Type</th>
            <td>{requirement.type}</td>
          </tr>
          <tr>
            <th>Description</th>
            <td>{requirement.description}</td>
          </tr>
          <tr>
            <th>Tech Stack</th>
            <td>{requirement.tech_stack || "-"}</td>
          </tr>
          <tr>
            <th>Timeline</th>
            <td>{requirement.timeline || "-"}</td>
          </tr>
          <tr>
            <th>Created</th>
            <td>{new Date(requirement.created_at).toLocaleString()}</td>
          </tr>
          <tr>
            <th>Updated</th>
            <td>{new Date(requirement.updated_at).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <h2>Status</h2>
      <select value={status} onChange={handleStatusChange} disabled={saving}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <h2>Progress</h2>
      <input
        type="number"
        min="0"
        max="100"
        value={progress}
        onChange={(e) => setProgress(Number(e.target.value))}
        disabled={saving}
      />
      <span> %</span>
      <button onClick={handleProgressSave} disabled={saving} style={{ marginLeft: 8 }}>
        {saving ? "Saving..." : "Save Progress"}
      </button>

      <h2>Notes</h2>
      <form onSubmit={handleAddNote}>
        <textarea
          rows={3}
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Add a note..."
        />
        <br />
        <button type="submit" disabled={addingNote || !noteContent.trim()}>
          {addingNote ? "Adding..." : "Add Note"}
        </button>
      </form>

      {notes.length === 0 ? (
        <p>No notes yet.</p>
      ) : (
        <ul>
          {notes.map((note) => (
            <li key={note.id} style={{ marginBottom: 8 }}>
              <p>{note.content}</p>
              <small>{new Date(note.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
