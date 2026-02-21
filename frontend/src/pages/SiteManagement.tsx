import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, fetchSiteContentAdmin, deleteSiteContent, setToken } from "../api/client";
import type { SiteContent } from "../types";
import "./SiteManagement.css";

export default function SiteManagement() {
  const [items, setItems] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSiteContentAdmin()
      .then(setItems)
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

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteSiteContent(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setToken(null);
        navigate("/admin/login");
        return;
      }
      alert((err as Error).message);
    }
  }

  if (loading) {
    return (
      <div className="site-mgmt">
        <div className="site-mgmt-inner">
          <div className="admin-dash-header">
            <h1>Site Content</h1>
          </div>
          <div className="site-cards">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="site-card site-card-skeleton" key={i}>
                <div className="skel-block" style={{ width: "40%", height: 16 }} />
                <div className="skel-block" style={{ width: "25%", height: 12, marginTop: 8 }} />
                <div className="skel-block" style={{ width: "100%", height: 14, marginTop: 16 }} />
                <div className="skel-block" style={{ width: "80%", height: 14, marginTop: 6 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="site-mgmt">
        <div className="site-mgmt-inner">
          <div className="admin-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="site-mgmt">
      <div className="site-mgmt-inner">
        {/* Header */}
        <div className="admin-dash-header">
          <h1>Site Content</h1>
          <div className="admin-dash-actions">
            <Link to="/admin/dashboard" className="btn-back-dash">
              Back to Dashboard
            </Link>
            <Link to="/admin/site/new" className="btn-new-cs">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              New Content
            </Link>
          </div>
        </div>

        {/* Content Cards */}
        {items.length === 0 ? (
          <div className="admin-table-wrap">
            <div className="admin-empty">
              <div className="admin-empty-icon">📝</div>
              <h3>No content yet</h3>
              <p>Create your first content entry to make your site editable.</p>
            </div>
          </div>
        ) : (
          <div className="site-cards">
            {items.map((item) => (
              <div key={item.id} className="site-card">
                <div className="site-card-header">
                  <div>
                    <h3 className="site-card-title">{item.title || item.key}</h3>
                    <span className="site-card-key">{item.key}</span>
                  </div>
                  <div className="site-card-actions">
                    <Link
                      to={`/admin/site/${item.id}`}
                      className="btn-table-action btn-edit"
                      title="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                    <button
                      className="btn-table-action btn-deactivate"
                      onClick={() => handleDelete(item.id, item.title || item.key)}
                      title="Delete"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v8a1 1 0 001 1h4a1 1 0 001-1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="site-card-preview">
                  {item.content.length > 120 ? item.content.slice(0, 120) + "…" : item.content}
                </p>
                {item.updated_at && (
                  <div className="site-card-meta">
                    Updated {new Date(item.updated_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
