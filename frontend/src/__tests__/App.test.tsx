import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

// Mock all page components to keep tests fast and focused on routing
vi.mock("../pages/HomePage", () => ({
  default: () => <div>HomePage</div>,
}));
vi.mock("../pages/PortfolioPage", () => ({
  default: () => <div>PortfolioPage</div>,
}));
vi.mock("../pages/CaseStudyDetail", () => ({
  default: () => <div>CaseStudyDetail</div>,
}));
vi.mock("../pages/ServiceDetail", () => ({
  default: () => <div>ServiceDetail</div>,
}));
vi.mock("../pages/AboutPage", () => ({
  default: () => <div>AboutPage</div>,
}));
vi.mock("../pages/ContactPage", () => ({
  default: () => <div>ContactPage</div>,
}));
vi.mock("../pages/AdminLogin", () => ({
  default: () => <div>AdminLogin</div>,
}));
vi.mock("../pages/AdminDashboard", () => ({
  default: () => <div>AdminDashboard</div>,
}));
vi.mock("../pages/RequirementDetail", () => ({
  default: () => <div>RequirementDetail</div>,
}));
vi.mock("../pages/PortfolioManagement", () => ({
  default: () => <div>PortfolioManagement</div>,
}));
vi.mock("../pages/CaseStudyForm", () => ({
  default: () => <div>CaseStudyForm</div>,
}));
vi.mock("../pages/NotFoundPage", () => ({
  default: () => <div>NotFoundPage</div>,
}));

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe("App routing", () => {
  it("/ renders HomePage", () => {
    renderApp("/");
    expect(screen.getByText("HomePage")).toBeInTheDocument();
  });

  it("/portfolio renders PortfolioPage", () => {
    renderApp("/portfolio");
    expect(screen.getByText("PortfolioPage")).toBeInTheDocument();
  });

  it("/portfolio/:slug renders CaseStudyDetail", () => {
    renderApp("/portfolio/ruth-ai");
    expect(screen.getByText("CaseStudyDetail")).toBeInTheDocument();
  });

  it("/about renders AboutPage", () => {
    renderApp("/about");
    expect(screen.getByText("AboutPage")).toBeInTheDocument();
  });

  it("/submit renders ContactPage", () => {
    renderApp("/submit");
    expect(screen.getByText("ContactPage")).toBeInTheDocument();
  });

  it("/admin/login renders AdminLogin", () => {
    renderApp("/admin/login");
    expect(screen.getByText("AdminLogin")).toBeInTheDocument();
  });

  it("/admin/dashboard redirects to login when no token", () => {
    renderApp("/admin/dashboard");
    // ProtectedRoute redirects to /admin/login, which renders AdminLogin mock
    expect(screen.getByText("AdminLogin")).toBeInTheDocument();
  });

  it("/admin/dashboard renders when authenticated", () => {
    sessionStorage.setItem("auth_token", "valid");
    renderApp("/admin/dashboard");
    expect(screen.getByText("AdminDashboard")).toBeInTheDocument();
  });

  it("/unknown-path renders NotFoundPage", () => {
    renderApp("/some/random/path");
    expect(screen.getByText("NotFoundPage")).toBeInTheDocument();
  });

  it("/admin/portfolio redirects to login when no token", () => {
    renderApp("/admin/portfolio");
    expect(screen.getByText("AdminLogin")).toBeInTheDocument();
  });

  it("/admin/portfolio renders when authenticated", () => {
    sessionStorage.setItem("auth_token", "valid");
    renderApp("/admin/portfolio");
    expect(screen.getByText("PortfolioManagement")).toBeInTheDocument();
  });
});
