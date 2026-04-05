import type { Profile, Project } from "@/lib/types";

export const profile: Profile = {
  name: "Anas Chahid Ksabi",
  headline: "AI Agent & Workflow Automation Engineer",
  shortBio:
    "I help businesses move faster by turning complex processes into intelligent, automated systems — built to scale and easy to own.",
  longBio:
    "I design and build AI-powered systems that automate business processes, connect your tools, and surface the right information at the right time. With a background in finance, I understand the business logic behind every workflow — so what I build drives real ROI, not just technical complexity.",
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
      "An internal operations dashboard for monitoring AI agent performance, task outcomes, and failure patterns in real time.",
    problem:
      "Businesses deploying AI agents have no visibility into what's working, what's failing, or where value is being lost.",
    solution:
      "Built an ops view that surfaces task status, retry paths, and agent notes — giving teams the control to iterate fast and reduce costly failures.",
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
      "An end-to-end pipeline that captures, qualifies, and routes inbound leads into automated follow-up sequences — cutting response time from hours to minutes.",
    problem:
      "Revenue was leaking through slow, manual lead handling spread across disconnected tools with no consistent follow-up process.",
    solution:
      "Designed and built a unified intake flow that normalizes lead data, applies qualification logic, and triggers personalized outreach automatically.",
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
