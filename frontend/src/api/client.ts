import type { LoginResponse, Note, Requirement, RequirementStatusResponse, CaseStudy, CaseStudyFormData, Service, Testimonial, SiteContent, SiteContentFormData, UserRole, UserInfo, ClientTestimonialPayload, InviteInfo } from "../types";

const API_BASE = "/api";

const TOKEN_KEY = "auth_token";
const ROLE_KEY = "user_role";

export function setToken(t: string | null): void {
  if (t) {
    sessionStorage.setItem(TOKEN_KEY, t);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ROLE_KEY);
  }
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setRole(role: string | null): void {
  if (role) {
    sessionStorage.setItem(ROLE_KEY, role);
  } else {
    sessionStorage.removeItem(ROLE_KEY);
  }
}

export function getRole(): UserRole | null {
  return sessionStorage.getItem(ROLE_KEY) as UserRole | null;
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
  const data = await handleResponse<LoginResponse>(res);
  setRole(data.role);
  return data;
}

// Invitation flow
export async function getInviteInfo(token: string): Promise<InviteInfo> {
  const res = await safeFetch(`${API_BASE}/auth/invite-info?token=${token}`);
  return handleResponse<InviteInfo>(res);
}

export async function acceptInvite(token: string, password: string): Promise<LoginResponse> {
  const res = await safeFetch(`${API_BASE}/auth/accept-invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  const data = await handleResponse<LoginResponse>(res);
  setRole(data.role);
  return data;
}

// Client self-registration
export async function register(email: string, password: string, name?: string): Promise<LoginResponse> {
  const payload: Record<string, string> = { email, password };
  if (name) payload.name = name;
  const res = await safeFetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<LoginResponse>(res);
  setRole(data.role);
  return data;
}

// Admin: Requirements
export async function fetchRequirements(): Promise<Requirement[]> {
  const res = await safeFetch(`${API_BASE}/admin/requirements`, {
    headers: authHeaders(),
  });
  return handleResponse<Requirement[]>(res);
}

export async function fetchRequirement(id: string): Promise<RequirementStatusResponse> {
  const res = await safeFetch(`${API_BASE}/admin/requirements/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse<RequirementStatusResponse>(res);
}

export async function updateStatus(id: string, newStatus: string): Promise<RequirementStatusResponse> {
  const res = await safeFetch(`${API_BASE}/admin/requirements/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status: newStatus }),
  });
  return handleResponse<RequirementStatusResponse>(res);
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

// Public API endpoints
export async function fetchCaseStudies(): Promise<CaseStudy[]> {
  const res = await safeFetch(`${API_BASE}/public/case-studies`);
  return handleResponse<CaseStudy[]>(res);
}

export async function fetchCaseStudy(slug: string): Promise<CaseStudy> {
  const res = await safeFetch(`${API_BASE}/public/case-studies/${slug}`);
  return handleResponse<CaseStudy>(res);
}

export async function fetchServices(): Promise<Service[]> {
  const res = await safeFetch(`${API_BASE}/public/services`);
  return handleResponse<Service[]>(res);
}

export async function fetchService(slug: string): Promise<Service> {
  const res = await safeFetch(`${API_BASE}/public/services/${slug}`);
  return handleResponse<Service>(res);
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const res = await safeFetch(`${API_BASE}/public/testimonials`);
  return handleResponse<Testimonial[]>(res);
}

export async function fetchSiteContent(key?: string): Promise<SiteContent[]> {
  const url = key ? `${API_BASE}/public/site-content?key=${key}` : `${API_BASE}/public/site-content`;
  const res = await safeFetch(url);
  return handleResponse<SiteContent[]>(res);
}

// Admin: Case Study Management
export async function fetchCaseStudiesAdmin(): Promise<CaseStudy[]> {
  const res = await safeFetch(`${API_BASE}/admin/case-studies`, {
    headers: authHeaders(),
  });
  return handleResponse<CaseStudy[]>(res);
}

export async function fetchCaseStudyAdmin(id: string): Promise<CaseStudy> {
  const res = await safeFetch(`${API_BASE}/admin/case-studies/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse<CaseStudy>(res);
}

export async function createCaseStudy(payload: CaseStudyFormData): Promise<CaseStudy> {
  const res = await safeFetch(`${API_BASE}/admin/case-studies`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<CaseStudy>(res);
}

export async function updateCaseStudy(id: string, payload: Partial<CaseStudyFormData>): Promise<CaseStudy> {
  const res = await safeFetch(`${API_BASE}/admin/case-studies/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<CaseStudy>(res);
}

export async function deleteCaseStudy(id: string): Promise<void> {
  const res = await safeFetch(`${API_BASE}/admin/case-studies/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = (data as { detail?: string })?.detail || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
}

// Admin: Site Content Management
export async function fetchSiteContentAdmin(): Promise<SiteContent[]> {
  const res = await safeFetch(`${API_BASE}/admin/site-content`, {
    headers: authHeaders(),
  });
  return handleResponse<SiteContent[]>(res);
}

export async function createSiteContent(payload: SiteContentFormData): Promise<SiteContent> {
  const res = await safeFetch(`${API_BASE}/admin/site-content`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<SiteContent>(res);
}

export async function updateSiteContent(id: string, payload: Partial<SiteContentFormData>): Promise<SiteContent> {
  const res = await safeFetch(`${API_BASE}/admin/site-content/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<SiteContent>(res);
}

// Admin: File Upload
export async function uploadFile(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const headers: Record<string, string> = {};
  const t = getToken();
  if (t) {
    headers["Authorization"] = `Bearer ${t}`;
  }
  const res = await safeFetch(`${API_BASE}/admin/uploads`, {
    method: "POST",
    headers,
    body: formData,
  });
  return handleResponse<{ url: string }>(res);
}

export async function deleteSiteContent(id: string): Promise<void> {
  const res = await safeFetch(`${API_BASE}/admin/site-content/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = (data as { detail?: string })?.detail || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
}

// Client Portal
export async function fetchMyRequirements(): Promise<Requirement[]> {
  const res = await safeFetch(`${API_BASE}/client/requirements`, {
    headers: authHeaders(),
  });
  return handleResponse<Requirement[]>(res);
}

export async function fetchMyRequirement(id: string): Promise<Requirement> {
  const res = await safeFetch(`${API_BASE}/client/requirements/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse<Requirement>(res);
}

export async function fetchMyNotes(id: string): Promise<Note[]> {
  const res = await safeFetch(`${API_BASE}/client/requirements/${id}/notes`, {
    headers: authHeaders(),
  });
  return handleResponse<Note[]>(res);
}

export async function submitClientTestimonial(
  requirementId: string,
  payload: ClientTestimonialPayload,
): Promise<Testimonial> {
  const res = await safeFetch(`${API_BASE}/client/requirements/${requirementId}/testimonial`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Testimonial>(res);
}

// Admin: User Management
export async function fetchUsers(): Promise<UserInfo[]> {
  const res = await safeFetch(`${API_BASE}/admin/users`, {
    headers: authHeaders(),
  });
  return handleResponse<UserInfo[]>(res);
}

export async function createUser(payload: { email: string; password: string; role: string }): Promise<UserInfo> {
  const res = await safeFetch(`${API_BASE}/admin/users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<UserInfo>(res);
}

export async function updateUser(id: string, payload: { email?: string; role?: string }): Promise<UserInfo> {
  const res = await safeFetch(`${API_BASE}/admin/users/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<UserInfo>(res);
}

export async function deleteUser(id: string): Promise<void> {
  const res = await safeFetch(`${API_BASE}/admin/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = (data as { detail?: string })?.detail || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
}
