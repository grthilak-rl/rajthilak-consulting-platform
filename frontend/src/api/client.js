const API_BASE = "/api";

let token = null;

export function setToken(t) {
  token = t;
}

export function getToken() {
  return token;
}

function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function handleResponse(res) {
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = data?.detail || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return res.json();
}

async function safeFetch(url, options) {
  try {
    return await fetch(url, options);
  } catch {
    throw new ApiError(
      "Unable to connect to the server. Please check your connection and try again.",
      0
    );
  }
}

export async function submitRequirement(payload) {
  const res = await safeFetch(`${API_BASE}/public/requirements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function login(email, password) {
  const res = await safeFetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function fetchRequirements() {
  const res = await safeFetch(`${API_BASE}/admin/requirements`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function fetchRequirement(id) {
  const res = await safeFetch(`${API_BASE}/admin/requirements/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function updateStatus(id, newStatus) {
  const res = await safeFetch(`${API_BASE}/admin/requirements/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status: newStatus }),
  });
  return handleResponse(res);
}

export async function updateProgress(id, progress) {
  const res = await safeFetch(`${API_BASE}/admin/requirements/${id}/progress`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ progress }),
  });
  return handleResponse(res);
}

export async function fetchNotes(id) {
  const res = await safeFetch(`${API_BASE}/admin/requirements/${id}/notes`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function createNote(id, content) {
  const res = await safeFetch(`${API_BASE}/admin/requirements/${id}/notes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  });
  return handleResponse(res);
}
