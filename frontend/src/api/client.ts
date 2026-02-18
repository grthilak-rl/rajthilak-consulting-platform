import type { LoginResponse, Note, Requirement } from "../types";

const API_BASE = "/api";

const TOKEN_KEY = "auth_token";

export function setToken(t: string | null): void {
  if (t) {
    sessionStorage.setItem(TOKEN_KEY, t);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) {
    headers["Authorization"] = `Bearer ${t}`;
  }
  return headers;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = (data as { detail?: string })?.detail || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch {
    throw new ApiError(
      "Unable to connect to the server. Please check your connection and try again.",
      0
    );
  }
}

export async function submitRequirement(payload: Record<string, unknown>): Promise<Requirement> {
  const res = await safeFetch(`${API_BASE}/public/requirements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Requirement>(res);
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await safeFetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<LoginResponse>(res);
}

export async function fetchRequirements(): Promise<Requirement[]> {
  const res = await safeFetch(`${API_BASE}/admin/requirements`, {
    headers: authHeaders(),
  });
  return handleResponse<Requirement[]>(res);
}

export async function fetchRequirement(id: string): Promise<Requirement> {
  const res = await safeFetch(`${API_BASE}/admin/requirements/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse<Requirement>(res);
}

export async function updateStatus(id: string, newStatus: string): Promise<Requirement> {
  const res = await safeFetch(`${API_BASE}/admin/requirements/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status: newStatus }),
  });
  return handleResponse<Requirement>(res);
}

export async function updateProgress(id: string, progress: number): Promise<Requirement> {
  const res = await safeFetch(`${API_BASE}/admin/requirements/${id}/progress`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ progress }),
  });
  return handleResponse<Requirement>(res);
}

export async function fetchNotes(id: string): Promise<Note[]> {
  const res = await safeFetch(`${API_BASE}/admin/requirements/${id}/notes`, {
    headers: authHeaders(),
  });
  return handleResponse<Note[]>(res);
}

export async function createNote(id: string, content: string): Promise<Note> {
  const res = await safeFetch(`${API_BASE}/admin/requirements/${id}/notes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  });
  return handleResponse<Note>(res);
}
