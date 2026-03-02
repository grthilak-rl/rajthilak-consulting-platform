import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ApiError,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  getToken,
  setToken,
} from "../api/client";
import type { UserInfo, UserRole } from "../types";
import "./UserManagement.css";

const ROLE_OPTIONS: UserRole[] = ["admin", "editor", "client"];

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  editor: "Editor",
  client: "Client",
};

/** Decode the JWT payload (base64) to extract the user ID from `sub` */
function getCurrentUserId(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const encodedPayload = parts[1] as string;
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/")));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export default function UserManagement() {
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();

  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  // Add user form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("client");
  const [addingUser, setAddingUser] = useState(false);
  const [addError, setAddError] = useState("");

  // Inline role editing
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleAuthError(err: unknown): boolean {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      setToken(null);
      navigate("/admin/login");
      return true;
    }
    return false;
  }

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((err: unknown) => {
        if (!handleAuthError(err)) {
          setError((err as Error).message);
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");

    if (!newEmail.trim() || !newPassword.trim()) {
      setAddError("Email and password are required.");
      return;
    }
    if (newPassword.length < 8) {
      setAddError("Password must be at least 8 characters.");
      return;
    }

    setAddingUser(true);
    try {
      const created = await createUser({
        email: newEmail.trim(),
        password: newPassword,
        role: newRole,
      });
      setUsers((prev) => [created, ...prev]);
      setNewEmail("");
      setNewPassword("");
      setNewRole("client");
      setShowAddForm(false);
    } catch (err) {
      if (!handleAuthError(err)) {
        setAddError((err as Error).message);
      }
    } finally {
      setAddingUser(false);
    }
  }

  async function handleRoleChange(userId: string, role: UserRole) {
    setEditingRoleId(null);
    setActionError("");
    try {
      const updated = await updateUser(userId, { role });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      if (!handleAuthError(err)) {
        setActionError((err as Error).message);
      }
    }
  }

  async function handleDelete(userId: string) {
    setDeletingId(userId);
    setActionError("");
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      if (!handleAuthError(err)) {
        setActionError((err as Error).message);
      }
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  if (loading) {
    return (
      <div className="user-mgmt">
        <div className="user-mgmt-inner">
          <div className="user-mgmt-header">
            <h1>User Management</h1>
          </div>
          <div className="user-table-wrap">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="user-skeleton-row" key={i}>
                <div className="skel-block" style={{ width: "35%" }} />
                <div className="skel-block" style={{ width: "14%" }} />
                <div className="skel-block" style={{ width: "20%" }} />
                <div className="skel-block" style={{ width: "18%" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-mgmt">
        <div className="user-mgmt-inner">
          <div className="user-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-mgmt">
      <div className="user-mgmt-inner">
        {/* Header */}
        <div className="user-mgmt-header">
          <div className="user-mgmt-header-left">
            <Link to="/admin/dashboard" className="btn-back">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Dashboard
            </Link>
            <h1>User Management</h1>
          </div>
          <button
            className="btn-add-user"
            onClick={() => {
              setShowAddForm((v) => !v);
              setAddError("");
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {showAddForm ? "Cancel" : "Add User"}
          </button>
        </div>

        {/* Action-level error */}
        {actionError && (
          <div className="alert-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {actionError}
            <button className="alert-dismiss" onClick={() => setActionError("")}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Add User Inline Form */}
        {showAddForm && (
          <div className="add-user-form-wrap">
            <h2>Add New User</h2>
            {addError && (
              <div className="alert-error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {addError}
              </div>
            )}
            <form className="add-user-form" onSubmit={handleAddUser}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-email">Email</label>
                <input
                  id="new-email"
                  className="form-input"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">Password</label>
                <input
                  id="new-password"
                  className="form-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-role">Role</label>
                <select
                  id="new-role"
                  className="form-select"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
              <div className="add-user-form-actions">
                <button type="submit" className="btn-save-user" disabled={addingUser}>
                  {addingUser ? "Saving…" : "Save User"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddError("");
                    setNewEmail("");
                    setNewPassword("");
                    setNewRole("client");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        {users.length === 0 ? (
          <div className="user-table-wrap">
            <div className="user-empty">
              <div className="user-empty-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>No users found</h3>
              <p>Add your first user using the button above.</p>
            </div>
          </div>
        ) : (
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const isConfirmingDelete = confirmDeleteId === user.id;

                  return (
                    <tr key={user.id} className={isSelf ? "user-row-self" : ""}>
                      <td data-label="Email">
                        <div className="user-email-cell">
                          <span className="user-email">{user.email}</span>
                          {isSelf && <span className="user-self-badge">You</span>}
                        </div>
                      </td>
                      <td data-label="Role">
                        {editingRoleId === user.id ? (
                          <div className="role-edit-wrap">
                            <select
                              className="role-select"
                              defaultValue={user.role}
                              autoFocus
                              onBlur={() => setEditingRoleId(null)}
                              onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                            >
                              {ROLE_OPTIONS.map((r) => (
                                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <button
                            className={`role-badge role-${user.role}`}
                            onClick={() => setEditingRoleId(user.id)}
                            title="Click to change role"
                          >
                            {ROLE_LABELS[user.role]}
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: "4px" }}>
                              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        )}
                      </td>
                      <td data-label="Created">
                        <span className="user-date">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td data-label="Actions">
                        {isConfirmingDelete ? (
                          <div className="delete-confirm">
                            <span className="delete-confirm-text">Are you sure?</span>
                            <button
                              className="btn-confirm-delete"
                              onClick={() => handleDelete(user.id)}
                              disabled={deletingId === user.id}
                            >
                              {deletingId === user.id ? "Deleting…" : "Yes, Delete"}
                            </button>
                            <button
                              className="btn-cancel-delete"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn-delete-user"
                            onClick={() => setConfirmDeleteId(user.id)}
                            disabled={isSelf}
                            title={isSelf ? "You cannot delete your own account" : "Delete user"}
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
