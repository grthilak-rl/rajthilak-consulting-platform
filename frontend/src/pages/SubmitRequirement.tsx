import { useState } from "react";
import { submitRequirement } from "../api/client";

interface RequirementForm {
  name: string;
  email: string;
  company: string;
  title: string;
  description: string;
  type: string;
  tech_stack: string;
  timeline: string;
}

type FormErrors = Partial<Record<keyof RequirementForm, string>>;

const INITIAL_FORM: RequirementForm = {
  name: "",
  email: "",
  company: "",
  title: "",
  description: "",
  type: "contract",
  tech_stack: "",
  timeline: "",
};

function validateForm(form: RequirementForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Invalid email format";
  }
  if (!form.title.trim()) errors.title = "Title is required";
  if (!form.description.trim()) errors.description = "Description is required";
  if (!form.type) errors.type = "Type is required";
  return errors;
}

export default function SubmitRequirement() {
  const [form, setForm] = useState<RequirementForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RequirementForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (!(form.company).trim()) payload.company = null;
      if (!(form.tech_stack).trim()) payload.tech_stack = null;
      if (!(form.timeline).trim()) payload.timeline = null;

      await submitRequirement(payload);

      setSuccess(true);
      setForm(INITIAL_FORM);
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div>
        <h1>Requirement Submitted</h1>
        <p>Your requirement has been submitted successfully. We will get back to you soon.</p>
        <button onClick={() => setSuccess(false)}>Submit Another</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Submit a Requirement</h1>
      {apiError && <p style={{ color: "red" }}>{apiError}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name *</label>
          <br />
          <input id="name" name="name" value={form.name} onChange={handleChange} />
          {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email">Email *</label>
          <br />
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
          {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="company">Company</label>
          <br />
          <input id="company" name="company" value={form.company} onChange={handleChange} />
        </div>

        <div>
          <label htmlFor="title">Title *</label>
          <br />
          <input id="title" name="title" value={form.title} onChange={handleChange} />
          {errors.title && <p style={{ color: "red" }}>{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description">Description *</label>
          <br />
          <textarea id="description" name="description" rows={4} value={form.description} onChange={handleChange} />
          {errors.description && <p style={{ color: "red" }}>{errors.description}</p>}
        </div>

        <div>
          <label htmlFor="type">Type *</label>
          <br />
          <select id="type" name="type" value={form.type} onChange={handleChange}>
            <option value="full_time">Full Time</option>
            <option value="contract">Contract</option>
            <option value="one_off">One-off</option>
          </select>
          {errors.type && <p style={{ color: "red" }}>{errors.type}</p>}
        </div>

        <div>
          <label htmlFor="tech_stack">Tech Stack</label>
          <br />
          <input id="tech_stack" name="tech_stack" value={form.tech_stack} onChange={handleChange} />
        </div>

        <div>
          <label htmlFor="timeline">Timeline</label>
          <br />
          <input id="timeline" name="timeline" value={form.timeline} onChange={handleChange} />
        </div>

        <br />
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
