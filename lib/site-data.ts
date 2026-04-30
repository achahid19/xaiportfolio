import type { Profile, Project, System } from "@/lib/types";

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
    title: "Package Eval Agent",
    slug: "agent-ops-desk",
    summary:
      "A web crawler agent specialized in package evaluation — it crawls npm, GitHub, and documentation pages, extracts the signals that matter, and delivers a structured adoption recommendation to Slack in seconds.",
    problem:
      "Fast-moving dev teams can't afford to adopt a library that breaks or gets abandoned. Manual due diligence — npm trends, GitHub health, CVE checks, doc quality — eats 30+ minutes per package and still gets skipped under pressure.",
    solution:
      "Built a Firecrawl-powered crawler agent that scrapes the right pages, extracts structured signals, and pipes everything through an AI layer to produce a clear go/no-go recommendation — turning 30 minutes of research into a 10-second read.",
    role: "End-to-end: system design, n8n workflow architecture, web crawling pipeline, and output formatting",
    stack: ["n8n", "Firecrawl", "OpenAI", "Slack"],
    links: [{ label: "Case Study", href: "#" }],
    featured: true,
    coverImage: "Library evaluation agent workflow"
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

export const systems: System[] = [
  // ── FEATURED (carousel on homepage) ──────────────────────────────
  {
    title: "Package Eval Agent",
    problem: "Manual package due diligence eats 30+ min per library and still gets skipped under pressure.",
    result: "Structured go/no-go recommendation delivered to Slack in under 10 seconds.",
    category: "AI Agent",
    tools: ["n8n", "Firecrawl", "OpenAI", "Slack"],
    featured: true
  },
  {
    title: "Daily Sprint Briefing",
    problem: "Teams waste 15–30 min every morning manually reviewing Jira to figure out what's critical.",
    result: "Full AI sprint health report in the inbox at 8 AM — readable in 30 seconds.",
    category: "AI Reporting",
    tools: ["Jira", "OpenRouter", "Gmail", "Postgres", "n8n"],
    featured: true
  },
  {
    title: "Real-Time Jira Notifications",
    problem: "High-priority tickets sit unnoticed for hours — delayed responses compound sprint risk.",
    result: "Critical ticket response time cut from hours to under 5 minutes across Slack, Gmail & Google Chat.",
    category: "Alerting",
    tools: ["Jira", "Slack", "Gmail", "OpenRouter", "n8n"],
    featured: true
  },
  {
    title: "Jira → Google Calendar Sync",
    problem: "Jira due dates are invisible in calendar tools — deadlines get missed or duplicated manually.",
    result: "Every Jira due date becomes a calendar event instantly — no manual duplication, no missed deadlines.",
    category: "Integration",
    tools: ["Jira", "Google Calendar", "Postgres", "n8n"],
    featured: true
  },
  {
    title: "Weekly Sprint Report",
    problem: "Weekly reporting eats 30–60 minutes of manual Jira pulls, metric computation, and formatting.",
    result: "1 hour of manual reporting eliminated every week — leadership gets full sprint visibility automatically.",
    category: "Reporting",
    tools: ["Jira", "Postgres", "Gmail", "n8n"],
    featured: true
  },
  // ── LIBRARY ───────────────────────────────────────────────────────
  {
    title: "Blocked Issue Monitor",
    problem: "Blocked sprint issues go unnoticed for days, silently delaying delivery until retrospectives.",
    result: "Blockers surface within 24 hours — before they cascade into sprint delays.",
    category: "Monitoring",
    tools: ["Jira", "Gmail", "n8n"]
  },
  {
    title: "n8n Workflow Backup",
    problem: "n8n has no built-in version control — one misconfiguration could wipe weeks of automation work.",
    result: "100% of automations versioned daily to GitHub — full recovery in under 5 minutes.",
    category: "DevOps",
    tools: ["n8n", "GitHub"]
  },
  {
    title: "Blocked Ticket Follow-up",
    problem: "Blocked tickets linger with no owner or resolution plan, draining sprint capacity silently.",
    result: "Every blocker beyond 2 days gets a follow-up subtask and an owner — no ticket stays stuck.",
    category: "Automation",
    tools: ["Jira", "n8n"]
  },
  {
    title: "Calendar Change Detection",
    problem: "Jira updates don't sync to calendar — teams work off stale deadlines and miss rescheduled work.",
    result: "Calendar and Jira stay in sync within seconds of any change — zero stale deadlines.",
    category: "Integration",
    tools: ["Jira", "Google Calendar", "Gmail", "Postgres", "n8n"]
  },
  {
    title: "Auto Issue Assignment",
    problem: "New Jira issues sit unassigned, stalling triage and adding friction to every sprint planning session.",
    result: "Unassigned tickets drop to 0 — every new issue has an owner within seconds of creation.",
    category: "Automation",
    tools: ["Jira", "n8n"]
  },
  {
    title: "Due Date Escalation",
    problem: "Approaching deadlines go unnoticed until overdue — managers learn about slippage in status meetings.",
    result: "3-level escalation (reminder → warning → manager alert) ensures no deadline slips without accountability.",
    category: "Monitoring",
    tools: ["Jira", "Gmail", "n8n"]
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
