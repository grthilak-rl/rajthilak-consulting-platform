import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ContactPage from "../ContactPage";

const mockSubmitRequirement = vi.fn();

vi.mock("../../api/client", () => ({
  submitRequirement: (...args: unknown[]) => mockSubmitRequirement(...args),
}));

vi.mock("../../components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

function renderContact() {
  return render(
    <MemoryRouter>
      <ContactPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ContactPage", () => {
  it("renders all required form fields", () => {
    renderContact();
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit Requirement/ })).toBeInTheDocument();
  });

  it("shows validation errors for empty required fields", async () => {
    const user = userEvent.setup();
    renderContact();

    await user.click(screen.getByRole("button", { name: /Submit Requirement/ }));

    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Project title is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(mockSubmitRequirement).not.toHaveBeenCalled();
  });

  it("shows email required error when empty", async () => {
    const user = userEvent.setup();
    renderContact();

    await user.type(screen.getByLabelText(/Full Name/), "John");
    // Leave email empty — required field
    await user.type(screen.getByLabelText(/Project Title/), "My Project");
    await user.type(screen.getByLabelText(/Description/), "Some description");
    await user.click(screen.getByRole("button", { name: /Submit Requirement/ }));

    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(mockSubmitRequirement).not.toHaveBeenCalled();
  });

  it("submits successfully and shows thank-you page", async () => {
    mockSubmitRequirement.mockResolvedValue({ id: "new-req" });
    const user = userEvent.setup();
    renderContact();

    await user.type(screen.getByLabelText(/Full Name/), "John Doe");
    await user.type(screen.getByLabelText(/Email Address/), "john@test.com");
    await user.type(screen.getByLabelText(/Project Title/), "AI Chatbot");
    await user.type(screen.getByLabelText(/Description/), "Build a chatbot");
    await user.click(screen.getByRole("button", { name: /Submit Requirement/ }));

    await waitFor(() => {
      expect(screen.getByText("Thank You!")).toBeInTheDocument();
    });
    expect(mockSubmitRequirement).toHaveBeenCalled();
  });

  it("shows API error message on failure", async () => {
    mockSubmitRequirement.mockRejectedValue(new Error("Server error"));
    const user = userEvent.setup();
    renderContact();

    await user.type(screen.getByLabelText(/Full Name/), "John Doe");
    await user.type(screen.getByLabelText(/Email Address/), "john@test.com");
    await user.type(screen.getByLabelText(/Project Title/), "AI Chatbot");
    await user.type(screen.getByLabelText(/Description/), "Build a chatbot");
    await user.click(screen.getByRole("button", { name: /Submit Requirement/ }));

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("can submit another requirement after success", async () => {
    mockSubmitRequirement.mockResolvedValue({ id: "req-1" });
    const user = userEvent.setup();
    renderContact();

    await user.type(screen.getByLabelText(/Full Name/), "John");
    await user.type(screen.getByLabelText(/Email Address/), "j@t.com");
    await user.type(screen.getByLabelText(/Project Title/), "Test");
    await user.type(screen.getByLabelText(/Description/), "Desc");
    await user.click(screen.getByRole("button", { name: /Submit Requirement/ }));

    await waitFor(() => {
      expect(screen.getByText("Thank You!")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Submit Another Requirement/ }));

    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.queryByText("Thank You!")).not.toBeInTheDocument();
  });
});
