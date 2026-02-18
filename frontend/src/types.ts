export interface Requirement {
  id: string;
  name: string;
  email: string;
  company: string | null;
  title: string;
  description: string;
  type: "full_time" | "contract" | "one_off";
  tech_stack: string | null;
  timeline: string | null;
  status: "new" | "accepted" | "in_progress" | "completed" | "rejected";
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  requirement_id: string;
  content: string;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface Project {
  name: string;
  description: string;
  tech_stack: string[];
  role: string;
}
