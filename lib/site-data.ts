import type {
  Achievement,
  HeroMetric,
  ProofMetric,
  Profile,
  Project,
  Service,
  SocialPost,
  System,
  Testimonial
} from "@/lib/types";

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
    "AI Agent Design",
    "Workflow Automation",
    "Prompt Engineering",
    "API Integrations",
    "JavaScript",
    "TypeScript",
    "Python",
    "Next.js",
    "Web Scraping",
    "System Design",
    "RAG",
    "MCP",
    "LangChain"
  ],
  tools: [
    "n8n",
    "Make",
    "OpenAI",
    "Claude",
    "OpenRouter",
    "Gemini",
    "Firecrawl",
    "ScrapingDog",
    "Airtable",
    "Postgres",
    "Slack API",
    "Google Workspace",
    "Vercel",
    "GitHub",
    "Docker"
  ],
  socialLinks: [
    { label: "GitHub",    href: "https://github.com/achahid19" },
    { label: "LinkedIn",  href: "https://www.linkedin.com/in/anas-chahid-ksabi/?skipRedirect=true" },
    { label: "Email",     href: "mailto:aixautomation01@gmail.com" },
    { label: "X",         href: "https://x.com/it_CryptoKs" },
    { label: "Flowsave",  href: "https://flowsave.space/" },
    { label: "Upwork",    href: "https://www.upwork.com/services/product/development-it-custom-n8n-workflow-that-automates-your-business-operations-end-to-end-2066511273559432464" }
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
  // ── FEATURED (homepage preview grid) ─────────────────────────────
  {
    id: "S-012",
    title: "HITL Content Pipeline",
    problem: "Scaling content output with AI means losing control — generated posts ship without review, breaking brand consistency and client trust.",
    result: "Three-stage human-in-the-loop pipeline (strategy → creative → final review) with full approve / revise / reject loops at every gate.",
    impact: "AI can 10x content volume, but only if humans stay in control of every decision that touches the client. This pipeline keeps quality locked in while removing all the manual bottlenecks between brief and publish.",
    category: "AI Agent",
    tags: ["Content Automation", "Human-in-the-Loop"],
    tools: ["n8n", "OpenRouter", "Gemini", "Airtable", "Slack", "Postgres"],
    featured: true
  },
  {
    id: "S-001",
    title: "Package Eval Agent",
    problem: "Manual package due diligence eats 30+ min per library and still gets skipped under pressure.",
    result: "Structured go/no-go recommendation delivered to Slack in under 10 seconds.",
    impact: "One bad dependency can cost a team weeks of refactoring. This agent kills that risk before it hits your codebase — keeping velocity high and your stack clean.",
    category: "AI Agent",
    tools: ["n8n", "Firecrawl", "OpenAI", "Slack"],
    featured: true
  },
  {
    id: "S-002",
    title: "Daily Sprint Briefing",
    problem: "Teams waste 15–30 min every morning manually reviewing Jira to figure out what's critical.",
    result: "Full AI sprint health report in the inbox at 8 AM — readable in 30 seconds.",
    impact: "When every team member starts the day aligned, standups get shorter and priorities stop shifting mid-sprint. That's hours recovered every week, compounding.",
    category: "AI Agent",
    tools: ["Jira", "OpenRouter", "Gmail", "Postgres", "n8n"],
    featured: true
  },
  {
    id: "S-003",
    title: "Priority Ticket Alert Hub",
    problem: "High-priority tickets sit unnoticed for hours — delayed responses compound sprint risk.",
    result: "Critical ticket response time cut from hours to under 5 minutes across Slack, Gmail & Google Chat.",
    impact: "Every hour a critical issue goes unnoticed is a hour of compounding risk. Closing that gap directly protects sprint delivery and stakeholder trust.",
    category: "Incident Alerting",
    tools: ["Jira", "Slack", "Gmail", "OpenRouter", "n8n"],
    featured: true
  },
  {
    id: "S-004",
    title: "Jira → Google Calendar Sync",
    problem: "Jira due dates are invisible in calendar tools — deadlines get missed or duplicated manually.",
    result: "Every Jira due date becomes a calendar event instantly — no manual duplication, no missed deadlines.",
    impact: "Missed deadlines don't just slip — they erode client confidence. Keeping every stakeholder working from the same real-time data eliminates that risk entirely.",
    category: "Calendar Sync",
    tools: ["Jira", "Google Calendar", "Postgres", "n8n"],
    featured: true
  },
  {
    id: "S-005",
    title: "Weekly Sprint Report",
    problem: "Weekly reporting eats 30–60 minutes of manual Jira pulls, metric computation, and formatting.",
    result: "1 hour of manual reporting eliminated every week — leadership gets full sprint visibility automatically.",
    impact: "Leadership visibility shouldn't cost an engineer an hour every Monday. Automating it frees senior time for actual work while giving decision-makers better data, faster.",
    category: "Sprint Reporting",
    tools: ["Jira", "Postgres", "Gmail", "n8n"],
    featured: true
  },
  // ── LIBRARY ───────────────────────────────────────────────────────
  {
    id: "S-013",
    title: "Weekly Portfolio Analysis Agent",
    problem: "Manual market research means jumping between Google Finance, news sites, and macro calendars — an hour of work every week pulling data that's already going stale.",
    result: "Full AI market report delivered to Gmail every week — live prices, macro context, risk signals, and a clear Hold / Add / Trim / Exit call per position.",
    impact: "An investor's edge is in the decision, not the data collection. Automating the entire research layer — Google Finance, macro news, risk alerts — means the analysis is always fresh, always consistent, and never skipped.",
    category: "AI Agent",
    tools: ["n8n", "ScrapingDog", "Google Sheets", "Google Finance", "Gmail"],
    featured: true
  },
  {
    id: "S-006",
    title: "Sprint Blocker Radar",
    problem: "Blocked sprint issues go unnoticed for days, silently delaying delivery until retrospectives.",
    result: "Blockers surface within 24 hours — before they cascade into sprint delays.",
    impact: "A blocker discovered on day 1 takes 10 minutes to resolve. The same blocker found on day 5 can derail an entire sprint. Catching it early is where the real savings are.",
    category: "Sprint Monitoring",
    tools: ["Jira", "Gmail", "n8n"]
  },
  {
    id: "S-007",
    title: "Daily Automation Backup",
    problem: "n8n has no built-in version control — one misconfiguration could wipe weeks of automation work.",
    result: "100% of automations versioned daily to GitHub — full recovery in under 5 minutes.",
    impact: "Your automation stack is infrastructure. Losing it without a recovery path means rebuilding from scratch — a risk no serious operation should carry.",
    category: "DevOps",
    tools: ["n8n", "GitHub"]
  },
  {
    id: "S-008",
    title: "Blocker Accountability Engine",
    problem: "Blocked tickets linger with no owner or resolution plan, draining sprint capacity silently.",
    result: "Every blocker beyond 2 days gets a follow-up subtask and an owner — no ticket stays stuck.",
    impact: "Accountability doesn't happen by default — it has to be built into the system. Forcing an owner onto every blocker turns a cultural problem into a solved process.",
    category: "Ticket Management",
    tools: ["Jira", "n8n"]
  },
  {
    id: "S-009",
    title: "Live Issue Change Propagator",
    problem: "Jira updates don't sync to calendar — teams work off stale deadlines and miss rescheduled work.",
    result: "Calendar and Jira stay in sync within seconds of any change — zero stale deadlines.",
    impact: "Stale schedules create invisible misalignment across teams. Eliminating that gap means no more 'I didn't know the deadline moved' — everyone works from the same truth.",
    category: "Calendar Sync",
    tools: ["Jira", "Google Calendar", "Gmail", "Postgres", "n8n"]
  },
  {
    id: "S-010",
    title: "Smart Ticket Auto-Assigner",
    problem: "New Jira issues sit unassigned, stalling triage and adding friction to every sprint planning session.",
    result: "Unassigned tickets drop to 0 — every new issue has an owner within seconds of creation.",
    impact: "Unassigned tickets are silent bottlenecks. Removing that friction from triage means sprint planning starts clean and no work slips through the cracks before it's even begun.",
    category: "Ticket Management",
    tools: ["Jira", "n8n"]
  },
  {
    id: "S-011",
    title: "Deadline Escalation Engine",
    problem: "Approaching deadlines go unnoticed until overdue — managers learn about slippage in status meetings.",
    result: "3-level escalation (reminder → warning → manager alert) ensures no deadline slips without accountability.",
    impact: "Deadline slippage is almost always preventable — the information exists, it just doesn't reach the right person in time. This system closes that gap automatically.",
    category: "Deadline Management",
    tools: ["Jira", "Gmail", "n8n"]
  },
];

export const heroMetrics: HeroMetric[] = [
  { v: "13+", label: "Systems shipped" },
  { v: "<5min", label: "P1 ticket response" },
  { v: "30→0.1", label: "Eval minutes / package" }
];

export const proofMetrics: ProofMetric[] = [
  { k: "Critical ticket response", v: "hours → <5 min" },
  { k: "Manual reporting eliminated", v: "1 hr / week" },
  { k: "Package due diligence", v: "30 min → 10 sec" },
  { k: "Sprint blocker discovery", v: "5 days → 24 hrs" },
  { k: "Automation backups", v: "100% daily" }
];

export const services: Service[] = [
  {
    num: "01",
    title: "Process Automation",
    desc: "Multi-step business processes turned into reliable, observable workflows. Lead handling, ops pipelines, internal tools that scale without adding headcount."
  },
  {
    num: "02",
    title: "AI Agent Development",
    desc: "Agents that research, decide, and act — handling tasks that used to need human judgment. Built with guardrails, logged, and reviewable."
  },
  {
    num: "03",
    title: "System Integration",
    desc: "Connecting CRMs, APIs, databases and channels into one data layer your team can trust. Less tool-tax, more signal."
  }
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "Anas turned a process we were dreading into a system we now lean on every day. Clear thinking, clean delivery.",
    who: "Operations Lead, B2B SaaS"
  },
  {
    quote:
      "He built faster than our internal team thought possible — and the workflow has run untouched for months.",
    who: "Founder, Product Studio"
  }
];

export const trustTools = [
  "n8n",
  "OpenAI",
  "Claude",
  "Firecrawl",
  "Postgres",
  "Vercel",
  "Slack",
  "Jira"
];

export const achievements: Achievement[] = [
  {
    id: "A-001",
    title: "n8n Course Level 1",
    issuer: "n8n",
    date: "2024",
    href: "https://community.n8n.io/badges/104/completed-n8n-course-level-1?username=anasks",
    description: "Completed the official n8n Level 1 course covering core workflow concepts, nodes, and automation fundamentals."
  },
  {
    id: "A-002",
    title: "n8n Course Level 2",
    issuer: "n8n",
    date: "2024",
    href: "https://community.n8n.io/badges/105/completed-n8n-course-level-2?username=anasks",
    description: "Completed the advanced n8n Level 2 course — error handling, sub-workflows, expressions, and production-ready automation patterns."
  },
  {
    id: "A-003",
    title: "n8n Verified Creator",
    issuer: "n8n",
    date: "2024",
    href: "https://n8n.io/creators/anasks/",
    description: "Published 3 workflow templates on the official n8n template library, verified by the n8n team."
  }
];

export const socialPosts: SocialPost[] = [
  {
    id: "SP-003",
    title: "Automated Weekly Portfolio Analysis with ScrapingDog + AI",
    excerpt:
      "Built a fully automated market intelligence workflow: Google Sheets watchlist triggers weekly, ScrapingDog pulls live Google Finance data and news in parallel, an AI agent synthesises everything into a structured report — Hold, Add, Trim, or Exit — and delivers it as a clean HTML email to Gmail. No manual research, no wasted morning.",
    platform: "LinkedIn",
    date: "2026-06-02",
    href: "https://www.linkedin.com/posts/anas-chahid-ksabi_n8n-automation-ai-ugcPost-7467513609993183232-SpVm/",
    tags: ["n8n", "ScrapingDog", "AI Agent", "Google Finance", "Gmail", "Partnership"]
  },
  {
    id: "SP-002",
    title: "Package Evaluator Agent — April Challenge Submission",
    excerpt:
      "Built a Firecrawl-powered web crawler agent that researches any npm package — scrapes GitHub, npm trends, and docs, then delivers a structured go/no-go recommendation to Slack in under 10 seconds. No more manual due diligence.",
    platform: "LinkedIn",
    challenge: "n8n Community Challenge April 2026",
    date: "2026-04-25",
    href: "https://www.linkedin.com/posts/anas-chahid-ksabi_n8n-firecrawl-automation-ugcPost-7448771011388481536-haI3/",
    tags: ["n8n", "Firecrawl", "AI Agent", "Slack"]
  },
  {
    id: "SP-001",
    title: "Human-in-the-Loop Content Pipeline — April Challenge Submission",
    excerpt:
      "Built a 3-stage HITL automation for a social media content agency: Sofia (strategy), Marcus (creative), and Taylor (final review) each hold a gate with full approve / revise / reject loops. AI drafts, humans decide.",
    platform: "LinkedIn",
    challenge: "n8n Community Challenge May 2026",
    date: "2026-05-25",
    href: "https://www.linkedin.com/feed/update/urn:li:activity:7464337434114338816/",
    tags: ["n8n", "HITL", "AI Agent"]
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
