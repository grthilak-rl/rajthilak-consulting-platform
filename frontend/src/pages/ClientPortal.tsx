import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, fetchMyRequirements, setToken } from "../api/client";
import type { Requirement } from "../types";
import "./ClientPortal.css";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  accepted: "Accepted",
  in_progress: "In Progress",
  completed: "Completed",
  rejected: "Rejected",
};

export default function ClientPortal() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyRequirements()
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

  function handleLogout() {
    setToken(null);
    navigate("/");
  }

  if (loading) {
    return (
      <div className="client-portal">
        <div className="client-portal-inner">
          <div className="client-portal-header">
            <h1>My Projects</h1>
          </div>
          <div className="client-table-wrap">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="client-skeleton-row" key={i}>
                <div className="skel-block" style={{ width: "35%" }} />
                <div className="skel-block" style={{ width: "14%" }} />
                <div className="skel-block" style={{ width: "20%" }} />
                <div className="skel-block" style={{ width: "14%" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-portal">
        <div className="client-portal-inner">
          <div className="client-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="client-portal">
      <div className="client-portal-inner">
        {/* Header */}
        <div className="client-portal-header">
          <h1>My Projects</h1>
          <button className="btn-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Logout
          </button>
        </div>

        {/* Table or empty state */}
        {requirements.length === 0 ? (
          <div className="client-table-wrap">
            <div className="client-empty">
              <div className="client-empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>No projects yet</h3>
              <p>Your submitted projects will appear here once they are being tracked.</p>
            </div>
          </div>
        ) : (
          <div className="client-table-wrap">
            <table className="client-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => navigate(`/portal/requirements/${req.id}`)}
                  >
                    <td data-label="Project">
                      <span className="portal-req-title">{req.title}</span>
                    </td>
                    <td data-label="Status">
                      <span className={`status-badge status-${req.status}`}>
                        {STATUS_LABELS[req.status]}
                      </span>
                    </td>
                    <td data-label="Progress">
                      <div className="portal-progress-cell">
                        <div className="portal-progress-bar-wrap">
                          <div
                            className="portal-progress-bar-fill"
                            style={{ width: `${req.progress}%` }}
                          />
                        </div>
                        <span className="portal-progress-pct">{req.progress}%</span>
                      </div>
                    </td>
                    <td data-label="Submitted">
                      <span className="portal-req-date">
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="client-portal-footer">
          <p>
            Need help? <Link to="/submit">Submit a new requirement</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
