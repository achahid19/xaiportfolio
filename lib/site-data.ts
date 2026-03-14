import type { Profile, Project } from "@/lib/types";

export const profile: Profile = {
  name: "Anas Chahid Ksabi",
  headline: "AI Agent & Workflow Automation Engineer",
  shortBio:
    "Building useful AI systems with a product mindset and a bias toward clear automation.",
  longBio:
    "I am a software engineer focused on AI agents and workflow automation with n8n. I like building systems that reduce repetitive work, connect disconnected tools, and turn fuzzy ideas into repeatable flows. My portfolio is intentionally part lab, part journal, and part proof that thoughtful automation can still feel human.",
  currentFocus: [
    "AI agents",
    "Workflow automation",
    "Product-minded execution"
  ],
  location: "Morocco, Casablanca",
  skills: [
    "JavaScript",
    "TypeScript",
    "Python",
    "Next.js",
    "Prompt engineering",
    "API integrations",
    "Workflow design"
  ],
  tools: [
    "n8n",
    "Make",
    "OpenAI APIs",
    "Claude Code",
    "Vercel",
    "GitHub",
    "Docker"
  ],
  socialLinks: [
    { label: "GitHub", href: "https://github.com/achahid19" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/anas-chahid-ksabi/?skipRedirect=true"
    },
    { label: "Email", href: "mailto:anasks1999@gmail.com" },
    { label: "X", href: "https://x.com/it_CryptoKs" }
  ]
};

export const projects: Project[] = [
  {
    title: "Agent Ops Desk",
    slug: "agent-ops-desk",
    summary:
      "An internal dashboard concept for tracking AI agent tasks, outcomes, and failure patterns.",
    problem:
      "Teams experimenting with agents often lack visibility into what the automations are actually doing and where they fail.",
    solution:
      "I designed a simple operations view that surfaces task status, retry paths, and notes so operators can improve prompts and workflows faster.",
    role: "Product-minded builder across UX, flow design, and front-end implementation",
    stack: ["Next.js", "TypeScript", "OpenAI", "n8n"],
    links: [{ label: "Case Study", href: "#" }],
    featured: true,
    coverImage: "Abstract operations dashboard concept"
  },
  {
    title: "Lead Capture Automation",
    slug: "lead-capture-automation",
    summary:
      "A lightweight automation pipeline that routes inbound leads into structured follow-up workflows.",
    problem:
      "Lead data often lands in multiple tools with no clean qualification path or response rhythm.",
    solution:
      "I mapped the handoff, normalized incoming fields, and routed qualified leads into automated sequences for faster follow-up.",
    role: "Workflow automation design and implementation",
    stack: ["n8n", "Webhooks", "CRM APIs", "Sheets"],
    links: [{ label: "Workflow Notes", href: "#" }],
    featured: true,
    coverImage: "Lead routing automation concept"
  },
  {
    title: "Content Research Assistant",
    slug: "content-research-assistant",
    summary:
      "A research helper flow that turns scattered inputs into a usable briefing pack for writing.",
    problem:
      "Research for content or strategy work is slow when notes live in many tabs and formats.",
    solution:
      "I created a system that gathers sources, extracts patterns, and outputs cleaner starting points for writing and planning.",
    role: "Automation builder with prompt and output design",
    stack: ["AI agents", "Prompt design", "Markdown", "Notion"],
    links: [{ label: "Project Outline", href: "#" }],
    featured: false,
    coverImage: "Research workflow concept"
  }
];

export const timeline = [
  {
    title: "Now",
    text: "Building AI-agent experiments and learning how to turn automation into a strong product skill."
  },
  {
    title: "What I care about",
    text: "Clarity, reliable workflows, and interfaces that make automation feel understandable rather than magical."
  },
  {
    title: "What this site will become",
    text: "A portfolio, a blog, and a public record of how I think through systems and implementation."
  }
];
