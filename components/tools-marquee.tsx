"use client";

/**
 * Simple Icons CDN: https://cdn.simpleicons.org/{slug}
 * SVGs are CC0 licensed. We apply CSS filter to match site theme.
 * For tools not in Simple Icons we render a compact SVG fallback.
 */

interface Tool {
  name: string;
  /** simple-icons slug, or undefined to use the text fallback */
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

const CDN = "https://cdn.simpleicons.org";

/** Generic plug icon for tools not in simple-icons */
function FallbackIcon() {
  return (
    <svg
      width="16"
      height="16"
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
  return (
    <li className="tools-marquee-item mono">
      {tool.slug ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${CDN}/${tool.slug}`}
          alt=""
          aria-hidden="true"
          width={16}
          height={16}
          className="tools-marquee-logo"
          loading="lazy"
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
