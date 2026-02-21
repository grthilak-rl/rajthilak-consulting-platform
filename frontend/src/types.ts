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

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  role: string;
  description: string;
  industry: string;
  technologies: string[];
  featured: boolean;
  metrics?: {
    value: string;
    label: string;
  }[];
  visual: {
    color: string;
    icon: string;
  };
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CaseStudyFormData {
  slug: string;
  title: string;
  role: string;
  description: string;
  industry: string;
  technologies: string[];
  featured: boolean;
  metrics: { value: string; label: string }[];
  visual_color: string;
  visual_icon: string;
  display_order: number;
  is_active: boolean;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  author_company: string;
  author_initials: string;
  content: string;
  rating: number;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SiteContent {
  id: string;
  key: string;
  title?: string;
  content: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface SiteContentFormData {
  key: string;
  title?: string;
  content: string;
  metadata?: Record<string, unknown>;
}
