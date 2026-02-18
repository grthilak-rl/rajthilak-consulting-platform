import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, fetchRequirements, setToken } from "../api/client";
import type { Requirement } from "../types";

export default function AdminDashboard() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {requirements.length === 0 ? (
        <p>No requirements submitted yet.</p>
      ) : (
        <table border={1} cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Title</th>
              <th>Client Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((req) => (
              <tr
                key={req.id}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/admin/requirements/${req.id}`)}
              >
                <td>{req.title}</td>
                <td>{req.name}</td>
                <td>{req.type}</td>
                <td>{req.status}</td>
                <td>{new Date(req.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
