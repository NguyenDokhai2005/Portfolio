export interface Project {
  id: string;
  title: string;
  description: string;
  /** Comma separated, exactly like the original data shape. */
  technologies: string;
  /** Comma separated. */
  key_features: string;
  image_url: string;
  image_urls?: string[];
  live_url?: string;
  github_url?: string;
  created_at?: string;
}

export interface Certificate {
  id: string;
  title: string;
  image_url: string;
  created_at?: string;
}

export interface TechStackItem {
  id: string;
  name: string;
  logo_url: string;
  created_at?: string;
}

export interface Comment {
  id: string;
  name: string;
  comment: string;
  image_url?: string | null;
  likes: number;
  is_pinned?: boolean;
  created_at?: string;
}

export interface NavItem {
  label: string;
  id: string;
}

export type PortfolioTab = 'projects' | 'certificates' | 'techstack';
