import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminLogin from "../AdminLogin";

const mockLogin = vi.fn();
const mockSetToken = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../../api/client", () => ({
  login: (...args: unknown[]) => mockLogin(...args),
  setToken: (...args: unknown[]) => mockSetToken(...args),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLogin() {
  return render(
    <MemoryRouter>
      <AdminLogin />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AdminLogin", () => {
  it("renders email, password fields and sign-in button", () => {
    renderLogin();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("calls login API and navigates on success", async () => {
    mockLogin.mockResolvedValue({ access_token: "jwt-123" });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin@example.com", "password");
      expect(mockSetToken).toHaveBeenCalledWith("jwt-123");
      expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("shows error message on API failure", async () => {
    mockLogin.mockRejectedValue(new Error("Invalid credentials"));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "bad@test.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("disables button and shows spinner while submitting", async () => {
    let resolveLogin: (value: unknown) => void;
    mockLogin.mockReturnValue(new Promise((r) => { resolveLogin = r; }));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Password"), "pass");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      const btn = screen.getByRole("button");
      expect(btn).toBeDisabled();
      expect(btn).toHaveTextContent(/Signing in/);
    });

    resolveLogin!({ access_token: "tok" });
  });
});
