export type SocialLink = {
  label: string;
  href: string;
};

export type Profile = {
  name: string;
  headline: string;
  shortBio: string;
  longBio: string;
  currentFocus: string[];
  location: string;
  skills: string[];
  tools: string[];
  socialLinks: SocialLink[];
};

export type Project = {
  title: string;
  slug: string;
  summary: string;
  problem: string;
  solution: string;
  role: string;
  stack: string[];
  links: SocialLink[];
  featured: boolean;
  coverImage: string;
};

export type BlogPostFrontmatter = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string[];
  coverImage: string;
  published: boolean;
};

export type BlogPost = BlogPostFrontmatter & {
  content: string;
};

export type System = {
  title: string;
  problem: string;   // one line — the pain
  result: string;    // one line — the win (numbers preferred)
  category: string;  // e.g. "AI Agent" | "Lead Gen" | "Sales" | "Ops" | "Content" | "Dev"
  tools: string[];
};

export type ContactSubmission = {
  name: string;
  email: string;
  message: string;
  submittedAt: string;
};

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  approved: boolean;
};
