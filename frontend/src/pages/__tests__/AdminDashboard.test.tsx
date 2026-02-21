import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "../AdminDashboard";
import type { Requirement } from "../../types";

const mockFetchRequirements = vi.fn();
const mockSetToken = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../../api/client", () => ({
  ApiError: class extends Error {
    status: number;
    constructor(msg: string, status: number) {
      super(msg);
      this.status = status;
    }
  },
  fetchRequirements: (...args: unknown[]) => mockFetchRequirements(...args),
  setToken: (...args: unknown[]) => mockSetToken(...args),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const MOCK_REQUIREMENTS: Requirement[] = [
  {
    id: "r1",
    name: "Alice",
    email: "alice@test.com",
    company: "Acme",
    title: "Build API",
    description: "REST API",
    type: "contract",
    tech_stack: "Python",
    timeline: "1 month",
    status: "new",
    progress: 0,
    created_at: "2025-01-15T00:00:00Z",
    updated_at: "2025-01-15T00:00:00Z",
  },
  {
    id: "r2",
    name: "Bob",
    email: "bob@test.com",
    company: null,
    title: "Mobile App",
    description: "iOS app",
    type: "full_time",
    tech_stack: null,
    timeline: null,
    status: "in_progress",
    progress: 50,
    created_at: "2025-02-01T00:00:00Z",
    updated_at: "2025-02-01T00:00:00Z",
  },
  {
    id: "r3",
    name: "Carol",
    email: "carol@test.com",
    company: "BigCo",
    title: "Data Pipeline",
    description: "ETL system",
    type: "one_off",
    tech_stack: "Spark",
    timeline: "2 weeks",
    status: "completed",
    progress: 100,
    created_at: "2025-03-01T00:00:00Z",
    updated_at: "2025-03-01T00:00:00Z",
  },
];

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AdminDashboard", () => {
  it("shows loading skeleton initially", () => {
    mockFetchRequirements.mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders stats after data loads", async () => {
    mockFetchRequirements.mockResolvedValue(MOCK_REQUIREMENTS);
    renderDashboard();

    await waitFor(() => {
      // Check stat values by their CSS class
      const statValues = document.querySelectorAll(".admin-stat-value");
      expect(statValues).toHaveLength(4);
      expect(statValues[0]).toHaveTextContent("3"); // Total
      expect(statValues[1]).toHaveTextContent("1"); // New
      expect(statValues[2]).toHaveTextContent("1"); // In Progress
      expect(statValues[3]).toHaveTextContent("1"); // Completed
    });
  });

  it("renders requirements table", async () => {
    mockFetchRequirements.mockResolvedValue(MOCK_REQUIREMENTS);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Build API")).toBeInTheDocument();
    });
    expect(screen.getByText("Mobile App")).toBeInTheDocument();
    expect(screen.getByText("Data Pipeline")).toBeInTheDocument();
  });

  it("filters by search query", async () => {
    mockFetchRequirements.mockResolvedValue(MOCK_REQUIREMENTS);
    const user = userEvent.setup();
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Build API")).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/Search/), "Mobile");

    expect(screen.getByText("Mobile App")).toBeInTheDocument();
    expect(screen.queryByText("Build API")).not.toBeInTheDocument();
    expect(screen.queryByText("Data Pipeline")).not.toBeInTheDocument();
  });

  it("filters by status", async () => {
    mockFetchRequirements.mockResolvedValue(MOCK_REQUIREMENTS);
    const user = userEvent.setup();
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Build API")).toBeInTheDocument();
    });

    // Find the status filter group and click "New"
    const statusLabels = screen.getAllByText("Status");
    const statusGroup = statusLabels.find(el => el.classList.contains("admin-filter-label"))!.closest(".admin-filter-group") as HTMLElement;
    await user.click(within(statusGroup).getByText("New"));

    expect(screen.getByText("Build API")).toBeInTheDocument();
    expect(screen.queryByText("Mobile App")).not.toBeInTheDocument();
    expect(screen.queryByText("Data Pipeline")).not.toBeInTheDocument();
  });

  it("has Manage Portfolio link", async () => {
    mockFetchRequirements.mockResolvedValue(MOCK_REQUIREMENTS);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Manage Portfolio")).toBeInTheDocument();
    });

    const link = screen.getByText("Manage Portfolio").closest("a");
    expect(link).toHaveAttribute("href", "/admin/portfolio");
  });

  it("has View Site link pointing to /", async () => {
    mockFetchRequirements.mockResolvedValue(MOCK_REQUIREMENTS);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("View Site")).toBeInTheDocument();
    });

    const link = screen.getByText("View Site").closest("a");
    expect(link).toHaveAttribute("href", "/");
  });

  it("logout clears token and navigates to login", async () => {
    mockFetchRequirements.mockResolvedValue(MOCK_REQUIREMENTS);
    const user = userEvent.setup();
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Logout"));

    expect(mockSetToken).toHaveBeenCalledWith(null);
    expect(mockNavigate).toHaveBeenCalledWith("/admin/login");
  });

  it("shows error state on fetch failure", async () => {
    mockFetchRequirements.mockRejectedValue(new Error("Server error"));
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });
});
