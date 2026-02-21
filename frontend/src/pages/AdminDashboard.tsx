import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, fetchRequirements, setToken } from "../api/client";
import type { Requirement } from "../types";
import "./AdminDashboard.css";

const STATUS_OPTIONS = ["All", "new", "accepted", "in_progress", "completed", "rejected"] as const;
const TYPE_OPTIONS = ["All", "full_time", "contract", "one_off"] as const;

const TYPE_LABELS: Record<string, string> = {
  full_time: "Full-Time",
  contract: "Contract",
  one_off: "One-Off",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  accepted: "Accepted",
  in_progress: "In Progress",
  completed: "Completed",
  rejected: "Rejected",
};

export default function AdminDashboard() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequirements()
      .then(setRequirements)
      .catch((err: unknown) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setToken(null);
          navigate("/admin/login");
          return;
        }
        setError((err as Error).message);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const filtered = useMemo(() => {
    let list = requirements;

    if (filterStatus !== "All") {
      list = list.filter((r) => r.status === filterStatus);
    }
    if (filterType !== "All") {
      list = list.filter((r) => r.type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          (r.company && r.company.toLowerCase().includes(q))
      );
    }

    return list;
  }, [requirements, filterStatus, filterType, searchQuery]);

  const stats = useMemo(() => {
    const total = requirements.length;
    const newCount = requirements.filter((r) => r.status === "new").length;
    const inProgress = requirements.filter((r) => r.status === "in_progress").length;
    const completed = requirements.filter((r) => r.status === "completed").length;
    return { total, newCount, inProgress, completed };
  }, [requirements]);

  function handleLogout() {
    setToken(null);
    navigate("/admin/login");
  }

  if (loading) {
    return (
      <div className="admin-dash">
        <div className="admin-dash-inner">
          <div className="admin-dash-header">
            <h1>Dashboard</h1>
          </div>
          <div className="admin-table-wrap">
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="admin-skeleton-row" key={i}>
                <div className="skel-block" style={{ width: "30%" }} />
                <div className="skel-block" style={{ width: "20%" }} />
                <div className="skel-block" style={{ width: "15%" }} />
                <div className="skel-block" style={{ width: "12%" }} />
                <div className="skel-block" style={{ width: "15%" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dash">
        <div className="admin-dash-inner">
          <div className="admin-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dash">
      <div className="admin-dash-inner">
        {/* Header */}
        <div className="admin-dash-header">
          <h1>Dashboard</h1>
          <div className="admin-dash-actions">
            <Link to="/" className="btn-view-site">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3M9 1h6m0 0v6m0-6L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              View Site
            </Link>
            <button className="btn-logout" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Quick Nav */}
        <div className="admin-nav-links">
          <Link to="/admin/portfolio" className="btn-manage-portfolio">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Manage Portfolio
          </Link>
          <Link to="/admin/site" className="btn-manage-site">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12.7 3.3a1 1 0 011.4 1.4l-8 8a1 1 0 01-.5.3l-2.5.6.6-2.5a1 1 0 01.3-.5l8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Manage Site
          </Link>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Total</div>
            <div className="admin-stat-value stat-primary">{stats.total}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">New</div>
            <div className="admin-stat-value stat-new">{stats.newCount}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">In Progress</div>
            <div className="admin-stat-value stat-progress">{stats.inProgress}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Completed</div>
            <div className="admin-stat-value stat-done">{stats.completed}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="admin-toolbar">
          <div className="admin-search">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, name, email, or company…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-filters">
            <div className="admin-filter-group">
              <span className="admin-filter-label">Status</span>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  className={`filter-pill${filterStatus === s ? " active" : ""}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s === "All" ? "All" : STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            <div className="admin-filter-group">
              <span className="admin-filter-label">Type</span>
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t}
                  className={`filter-pill${filterType === t ? " active" : ""}`}
                  onClick={() => setFilterType(t)}
                >
                  {t === "All" ? "All" : TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="admin-table-wrap">
            <div className="admin-empty">
              <div className="admin-empty-icon">
                {requirements.length === 0 ? "📋" : "🔍"}
              </div>
              <h3>
                {requirements.length === 0
                  ? "No requirements yet"
                  : "No matching requirements"}
              </h3>
              <p>
                {requirements.length === 0
                  ? "Requirements will appear here once clients submit them."
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => navigate(`/admin/requirements/${req.id}`)}
                  >
                    <td data-label="Title">
                      <span className="req-title">{req.title}</span>
                    </td>
                    <td data-label="Client">
                      <span className="req-client">{req.name}</span>
                    </td>
                    <td data-label="Type">
                      <span className="type-badge">{TYPE_LABELS[req.type]}</span>
                    </td>
                    <td data-label="Status">
                      <span className={`status-badge status-${req.status}`}>
                        {STATUS_LABELS[req.status]}
                      </span>
                    </td>
                    <td data-label="Date">
                      <span className="req-date">
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
