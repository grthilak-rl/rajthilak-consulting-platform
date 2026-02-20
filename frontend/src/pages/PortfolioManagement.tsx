import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ApiError,
  fetchCaseStudiesAdmin,
  deleteCaseStudy,
  updateCaseStudy,
  setToken,
} from "../api/client";
import type { CaseStudy } from "../types";
import "./PortfolioManagement.css";

export default function PortfolioManagement() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterFeatured, setFilterFeatured] = useState<"all" | "featured" | "regular">("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCaseStudiesAdmin()
      .then(setCaseStudies)
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
    let list = caseStudies;

    if (filterStatus === "active") list = list.filter((c) => c.is_active);
    else if (filterStatus === "inactive") list = list.filter((c) => !c.is_active);

    if (filterFeatured === "featured") list = list.filter((c) => c.featured);
    else if (filterFeatured === "regular") list = list.filter((c) => !c.featured);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q)
      );
    }

    return list;
  }, [caseStudies, filterStatus, filterFeatured, searchQuery]);

  async function handleDeactivate(id: string, title: string) {
    if (!confirm(`Deactivate "${title}"? It will be hidden from the public site.`)) return;
    try {
      await deleteCaseStudy(id);
      setCaseStudies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: false } : c))
      );
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setToken(null);
        navigate("/admin/login");
        return;
      }
      alert((err as Error).message);
    }
  }

  async function handleActivate(id: string) {
    try {
      await updateCaseStudy(id, { is_active: true });
      setCaseStudies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: true } : c))
      );
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
      <div className="portfolio-mgmt">
        <div className="portfolio-mgmt-inner">
          <div className="admin-dash-header">
            <h1>Portfolio</h1>
          </div>
          <div className="admin-table-wrap">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="admin-skeleton-row" key={i}>
                <div className="skel-block" style={{ width: "35%" }} />
                <div className="skel-block" style={{ width: "20%" }} />
                <div className="skel-block" style={{ width: "12%" }} />
                <div className="skel-block" style={{ width: "12%" }} />
                <div className="skel-block" style={{ width: "8%" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-mgmt">
        <div className="portfolio-mgmt-inner">
          <div className="admin-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-mgmt">
      <div className="portfolio-mgmt-inner">
        {/* Header */}
        <div className="admin-dash-header">
          <h1>Portfolio</h1>
          <div className="admin-dash-actions">
            <Link to="/admin/dashboard" className="btn-back-dash">
              Back to Dashboard
            </Link>
            <Link to="/admin/portfolio/new" className="btn-new-cs">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              New Project
            </Link>
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
              placeholder="Search by title, industry, or role…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-filters">
            <div className="admin-filter-group">
              <span className="admin-filter-label">Status</span>
              {(["all", "active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  className={`filter-pill${filterStatus === s ? " active" : ""}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div className="admin-filter-group">
              <span className="admin-filter-label">Featured</span>
              {(["all", "featured", "regular"] as const).map((f) => (
                <button
                  key={f}
                  className={`filter-pill${filterFeatured === f ? " active" : ""}`}
                  onClick={() => setFilterFeatured(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
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
                {caseStudies.length === 0 ? "📁" : "🔍"}
              </div>
              <h3>
                {caseStudies.length === 0 ? "No projects yet" : "No matching projects"}
              </h3>
              <p>
                {caseStudies.length === 0
                  ? "Create your first project to showcase your work."
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
                  <th>Industry</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cs) => (
                  <tr key={cs.id}>
                    <td data-label="Title">
                      <div className="case-study-title-cell">
                        <span className="cs-title">{cs.title}</span>
                        <span className="cs-role">{cs.role}</span>
                      </div>
                    </td>
                    <td data-label="Industry">
                      <span className="cs-industry">{cs.industry}</span>
                    </td>
                    <td data-label="Status">
                      <span className={`status-badge ${cs.is_active ? "status-active" : "status-inactive"}`}>
                        {cs.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td data-label="Featured">
                      {cs.featured ? (
                        <span className="featured-badge">Featured</span>
                      ) : (
                        <span className="cs-industry">—</span>
                      )}
                    </td>
                    <td data-label="Order">
                      <span className="cs-order">{cs.display_order}</span>
                    </td>
                    <td data-label="Actions">
                      <div className="table-actions">
                        <Link
                          to={`/admin/portfolio/${cs.id}`}
                          className="btn-table-action btn-edit"
                          title="Edit"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Link>
                        {cs.is_active ? (
                          <button
                            className="btn-table-action btn-deactivate"
                            onClick={() => handleDeactivate(cs.id, cs.title)}
                            title="Deactivate"
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            className="btn-table-action btn-activate"
                            onClick={() => handleActivate(cs.id)}
                            title="Activate"
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M5.5 8l2 2 3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        )}
                      </div>
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
