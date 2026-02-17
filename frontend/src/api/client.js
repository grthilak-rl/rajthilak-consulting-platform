const API_BASE = "/api";

export async function submitRequirement(payload) {
  const res = await fetch(`${API_BASE}/public/requirements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to submit requirement");
  }

  return res.json();
}
