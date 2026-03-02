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

export type UserRole = "admin" | "editor" | "client";

export interface LoginResponse {
  access_token: string;
  role: UserRole;
}

export interface UserInfo {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface ClientTestimonialPayload {
  content: string;
  rating: number;
  author_role?: string;
}

export interface InviteInfo {
  email: string;
}

export interface RequirementStatusResponse extends Requirement {
  invite_link?: string | null;
}

export interface Project {
  name: string;
  description: string;
  tech_stack: string[];
  role: string;
}

export interface TechnologyItem {
  name: string;
  category: string;
}

export interface GalleryItem {
  url: string;
  caption: string;
  type: "screenshot" | "architecture";
}

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  role: string;
  description: string;
  industry: string;
  technologies: TechnologyItem[];
  featured: boolean;
  metrics?: {
    value: string;
    label: string;
  }[];
  problem?: string;
  solution?: string;
  role_description?: string;
  key_features?: string[];
  architecture?: string;
  challenges?: string;
  impact?: string;
  gallery?: GalleryItem[];
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
  technologies: TechnologyItem[];
  featured: boolean;
  metrics: { value: string; label: string }[];
  problem: string;
  solution: string;
  role_description: string;
  key_features: string[];
  architecture: string;
  challenges: string;
  impact: string;
  gallery: GalleryItem[];
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
