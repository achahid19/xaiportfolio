"use client";

/**
 * Brand logos via Simple Icons on jsDelivr (CC0).
 * Each logo is rendered as a CSS mask so we control its color
 * with background-color — dim by default, var(--accent) on hover.
 */

interface Tool {
  name: string;
  /** simple-icons slug, or undefined for the geometric fallback */
  slug?: string;
}

const TOOLS: ReadonlyArray<Tool> = [
  { name: "n8n",             slug: "n8n" },
  { name: "Make",            slug: "make" },
  { name: "OpenAI",          slug: "openai" },
  { name: "Anthropic",       slug: "anthropic" },
  { name: "Firecrawl",       slug: undefined },
  { name: "OpenRouter",      slug: undefined },
  { name: "PostgreSQL",      slug: "postgresql" },
  { name: "Vercel",          slug: "vercel" },
  { name: "GitHub",          slug: "github" },
  { name: "Docker",          slug: "docker" },
  { name: "Slack",           slug: "slack" },
  { name: "Gmail",           slug: "gmail" },
  { name: "Google Calendar", slug: "googlecalendar" },
  { name: "Jira",            slug: "jira" },
  { name: "Notion",          slug: "notion" },
  { name: "Webhooks",        slug: undefined },
];

const CDN = "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons";

/** Fallback for tools not in Simple Icons */
function FallbackIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="tools-marquee-svg-fallback"
      aria-hidden="true"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function ToolItem({ tool }: { tool: Tool }) {
  const maskUrl = tool.slug
    ? `url(${CDN}/${tool.slug}.svg)`
    : undefined;

  return (
    <li className="tools-marquee-item mono">
      {maskUrl ? (
        <span
          className="tools-marquee-logo"
          aria-hidden="true"
          style={{
            WebkitMaskImage: maskUrl,
            maskImage: maskUrl,
          }}
        />
      ) : (
        <FallbackIcon />
      )}
      <span>{tool.name}</span>
      <span className="tools-marquee-sep" aria-hidden="true">·</span>
    </li>
  );
}

export function ToolsMarquee() {
  return (
    <div className="tools-marquee-wrap">
      <span className="tools-marquee-label mono">Built with</span>
      <div className="tools-marquee-overflow" aria-hidden="true">
        <ul className="tools-marquee-track">
          {[...TOOLS, ...TOOLS].map((tool, i) => (
            <ToolItem key={`${tool.name}-${i}`} tool={tool} />
          ))}
        </ul>
      </div>
    </div>
  );
}
