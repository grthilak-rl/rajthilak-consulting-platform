import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PortfolioManagement from "../PortfolioManagement";
import type { CaseStudy } from "../../types";

const mockFetchCaseStudiesAdmin = vi.fn();
const mockDeleteCaseStudy = vi.fn();
const mockUpdateCaseStudy = vi.fn();
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
  fetchCaseStudiesAdmin: (...args: unknown[]) => mockFetchCaseStudiesAdmin(...args),
  deleteCaseStudy: (...args: unknown[]) => mockDeleteCaseStudy(...args),
  updateCaseStudy: (...args: unknown[]) => mockUpdateCaseStudy(...args),
  setToken: (...args: unknown[]) => mockSetToken(...args),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const MOCK_CASE_STUDIES: CaseStudy[] = [
  {
    id: "cs-1",
    slug: "ruth-ai",
    title: "Ruth AI",
    role: "AI/ML Engineer",
    description: "AI platform",
    industry: "AI / ML",
    technologies: ["Python", "TensorFlow"],
    featured: true,
    metrics: [{ value: "60%", label: "Faster" }],
    visual: { color: "primary", icon: "code" },
    display_order: 0,
    is_active: true,
  },
  {
    id: "cs-2",
    slug: "hit-platform",
    title: "HIT Platform",
    role: "Backend Engineer",
    description: "Healthcare system",
    industry: "Healthcare",
    technologies: ["Java", "Spring"],
    featured: false,
    visual: { color: "healthcare", icon: "activity" },
    display_order: 1,
    is_active: true,
  },
  {
    id: "cs-3",
    slug: "old-project",
    title: "Old Project",
    role: "Developer",
    description: "Legacy system",
    industry: "Finance",
    technologies: ["Ruby"],
    featured: false,
    visual: { color: "fintech", icon: "briefcase" },
    display_order: 2,
    is_active: false,
  },
];

function renderPortfolio() {
  return render(
    <MemoryRouter>
      <PortfolioManagement />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PortfolioManagement", () => {
  it("shows loading skeleton initially", () => {
    mockFetchCaseStudiesAdmin.mockReturnValue(new Promise(() => {}));
    renderPortfolio();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
  });

  it("renders project table after data loads", async () => {
    mockFetchCaseStudiesAdmin.mockResolvedValue(MOCK_CASE_STUDIES);
    renderPortfolio();

    await waitFor(() => {
      expect(screen.getByText("Ruth AI")).toBeInTheDocument();
    });
    expect(screen.getByText("HIT Platform")).toBeInTheDocument();
    expect(screen.getByText("Old Project")).toBeInTheDocument();
  });

  it("filters by search query", async () => {
    mockFetchCaseStudiesAdmin.mockResolvedValue(MOCK_CASE_STUDIES);
    const user = userEvent.setup();
    renderPortfolio();

    await waitFor(() => {
      expect(screen.getByText("Ruth AI")).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/Search/), "Healthcare");

    expect(screen.getByText("HIT Platform")).toBeInTheDocument();
    expect(screen.queryByText("Ruth AI")).not.toBeInTheDocument();
  });

  it("filters by status (active/inactive)", async () => {
    mockFetchCaseStudiesAdmin.mockResolvedValue(MOCK_CASE_STUDIES);
    const user = userEvent.setup();
    renderPortfolio();

    await waitFor(() => {
      expect(screen.getByText("Ruth AI")).toBeInTheDocument();
    });

    const filterLabels = screen.getAllByText("Status");
    const statusGroup = filterLabels.find(el => el.classList.contains("admin-filter-label"))!.closest(".admin-filter-group") as HTMLElement;
    await user.click(within(statusGroup).getByText("Inactive"));

    expect(screen.getByText("Old Project")).toBeInTheDocument();
    expect(screen.queryByText("Ruth AI")).not.toBeInTheDocument();
    expect(screen.queryByText("HIT Platform")).not.toBeInTheDocument();
  });

  it("filters by featured", async () => {
    mockFetchCaseStudiesAdmin.mockResolvedValue(MOCK_CASE_STUDIES);
    const user = userEvent.setup();
    renderPortfolio();

    await waitFor(() => {
      expect(screen.getByText("Ruth AI")).toBeInTheDocument();
    });

    const featLabels = screen.getAllByText("Featured");
    const featGroup = featLabels.find(el => el.classList.contains("admin-filter-label"))!.closest(".admin-filter-group") as HTMLElement;
    await user.click(within(featGroup).getByText("Featured", { selector: "button" }));

    expect(screen.getByText("Ruth AI")).toBeInTheDocument();
    expect(screen.queryByText("HIT Platform")).not.toBeInTheDocument();
  });

  it("has 'New Project' link to /admin/portfolio/new", async () => {
    mockFetchCaseStudiesAdmin.mockResolvedValue(MOCK_CASE_STUDIES);
    renderPortfolio();

    await waitFor(() => {
      expect(screen.getByText("New Project")).toBeInTheDocument();
    });

    const link = screen.getByText("New Project").closest("a");
    expect(link).toHaveAttribute("href", "/admin/portfolio/new");
  });

  it("has edit links for each project", async () => {
    mockFetchCaseStudiesAdmin.mockResolvedValue(MOCK_CASE_STUDIES);
    renderPortfolio();

    await waitFor(() => {
      expect(screen.getByText("Ruth AI")).toBeInTheDocument();
    });

    const editLinks = screen.getAllByTitle("Edit");
    expect(editLinks).toHaveLength(3);
    expect(editLinks[0]?.closest("a")).toHaveAttribute("href", "/admin/portfolio/cs-1");
  });

  it("deactivate button calls deleteCaseStudy", async () => {
    mockFetchCaseStudiesAdmin.mockResolvedValue(MOCK_CASE_STUDIES);
    mockDeleteCaseStudy.mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    renderPortfolio();

    await waitFor(() => {
      expect(screen.getByText("Ruth AI")).toBeInTheDocument();
    });

    const deactivateButtons = screen.getAllByTitle("Deactivate");
    await user.click(deactivateButtons[0]!);

    expect(mockDeleteCaseStudy).toHaveBeenCalledWith("cs-1");
  });

  it("shows error state on fetch failure", async () => {
    mockFetchCaseStudiesAdmin.mockRejectedValue(new Error("Failed to load"));
    renderPortfolio();

    await waitFor(() => {
      expect(screen.getByText("Failed to load")).toBeInTheDocument();
    });
  });

  it("shows empty state when no projects exist", async () => {
    mockFetchCaseStudiesAdmin.mockResolvedValue([]);
    renderPortfolio();

    await waitFor(() => {
      expect(screen.getByText("No projects yet")).toBeInTheDocument();
    });
  });
});
