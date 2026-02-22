import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  setToken,
  getToken,
  ApiError,
  login,
  submitRequirement,
  fetchRequirements,
  fetchCaseStudiesAdmin,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
} from "../client";

function mockFetch(body: unknown, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

function mockFetchError(detail: string, status: number) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ detail }), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe("setToken / getToken", () => {
  it("stores and retrieves a token", () => {
    setToken("abc123");
    expect(getToken()).toBe("abc123");
  });

  it("removes token when set to null", () => {
    setToken("abc123");
    setToken(null);
    expect(getToken()).toBeNull();
  });
});

describe("ApiError", () => {
  it("has message and status", () => {
    const err = new ApiError("Not found", 404);
    expect(err.message).toBe("Not found");
    expect(err.status).toBe(404);
    expect(err).toBeInstanceOf(Error);
  });
});

describe("login", () => {
  it("calls POST /api/auth/login and returns token", async () => {
    const spy = mockFetch({ access_token: "jwt-token" });

    const result = await login("admin@example.com", "pass");

    expect(result.access_token).toBe("jwt-token");
    expect(spy).toHaveBeenCalledWith("/api/auth/login", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ email: "admin@example.com", password: "pass" }),
    }));
  });

  it("throws ApiError on 401", async () => {
    mockFetchError("Invalid credentials", 401);

    try {
      await login("bad@example.com", "wrong");
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(401);
      expect((err as ApiError).message).toBe("Invalid credentials");
    }
  });
});

describe("submitRequirement", () => {
  it("calls POST /api/public/requirements", async () => {
    const payload = { name: "John", email: "j@test.com", title: "Test", description: "Desc", type: "contract" };
    const spy = mockFetch({ id: "uuid-1", ...payload, status: "new" });

    const result = await submitRequirement(payload);

    expect(result.id).toBe("uuid-1");
    expect(spy).toHaveBeenCalledWith("/api/public/requirements", expect.objectContaining({
      method: "POST",
    }));
  });
});

describe("fetchRequirements", () => {
  it("includes auth header", async () => {
    setToken("my-token");
    const spy = mockFetch([]);

    await fetchRequirements();

    const calledHeaders = spy.mock.calls[0]?.[1]?.headers as Record<string, string> | undefined;
    expect(calledHeaders?.["Authorization"]).toBe("Bearer my-token");
  });

  it("returns requirement list", async () => {
    setToken("token");
    mockFetch([{ id: "1", title: "Req 1" }]);

    const result = await fetchRequirements();
    expect(result).toHaveLength(1);
  });
});

describe("fetchCaseStudiesAdmin", () => {
  it("calls GET /api/admin/case-studies with auth", async () => {
    setToken("token");
    const spy = mockFetch([]);

    await fetchCaseStudiesAdmin();

    expect(spy).toHaveBeenCalledWith("/api/admin/case-studies", expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer token" }),
    }));
  });
});

describe("createCaseStudy", () => {
  it("calls POST /api/admin/case-studies with payload", async () => {
    setToken("token");
    const payload = {
      slug: "test",
      title: "Test",
      role: "Dev",
      description: "Desc",
      industry: "Tech",
      technologies: [{ name: "React", category: "Framework" }],
      featured: false,
      metrics: [],
      visual_color: "primary",
      visual_icon: "code",
      display_order: 0,
      is_active: true,
    };
    const spy = mockFetch({ id: "new-id", ...payload });

    const result = await createCaseStudy(payload);

    expect(result.id).toBe("new-id");
    expect(spy).toHaveBeenCalledWith("/api/admin/case-studies", expect.objectContaining({
      method: "POST",
      body: JSON.stringify(payload),
    }));
  });
});

describe("updateCaseStudy", () => {
  it("calls PATCH /api/admin/case-studies/:id", async () => {
    setToken("token");
    const spy = mockFetch({ id: "cs-1", title: "Updated" });

    await updateCaseStudy("cs-1", { title: "Updated" });

    expect(spy).toHaveBeenCalledWith("/api/admin/case-studies/cs-1", expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({ title: "Updated" }),
    }));
  });
});

describe("deleteCaseStudy", () => {
  it("calls DELETE /api/admin/case-studies/:id", async () => {
    setToken("token");
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 204 })
    );

    await deleteCaseStudy("cs-1");

    expect(spy).toHaveBeenCalledWith("/api/admin/case-studies/cs-1", expect.objectContaining({
      method: "DELETE",
    }));
  });

  it("throws ApiError on failure", async () => {
    setToken("token");
    mockFetchError("Not found", 404);

    await expect(deleteCaseStudy("bad-id")).rejects.toThrow(ApiError);
  });
});

describe("network failure", () => {
  it("wraps network error into ApiError with status 0", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(login("a@b.com", "pass")).rejects.toMatchObject({
      message: "Unable to connect to the server. Please check your connection and try again.",
      status: 0,
    });
  });
});
