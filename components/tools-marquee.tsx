"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Brand logos via Simple Icons on jsDelivr (CC0).
 * Dock-style magnification: items near the cursor scale up with a
 * gaussian spread, exactly like the macOS dock.
 */

interface Tool {
  name: string;
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

const CDN  = "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons";

/** Gaussian curve — controls how wide the magnification spreads */
const MAX_SCALE = 1.65;
const SIGMA     = 90; // px — wider = neighbours scale more

function gaussian(dist: number) {
  return Math.exp(-(dist * dist) / (2 * SIGMA * SIGMA));
}

/* ── Fallback icon for tools not in Simple Icons ── */
function FallbackIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className="tools-marquee-svg-fallback" aria-hidden="true"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

/* ── Single tool pill ── */
function ToolItem({
  tool,
  mouseX,
}: {
  tool: Tool;
  mouseX: number | null;
}) {
  const liRef = useRef<HTMLLIElement>(null);
  const maskUrl = tool.slug ? `url(${CDN}/${tool.slug}.svg)` : undefined;

  /* Compute scale from cursor distance */
  let scale = 1;
  if (mouseX !== null && liRef.current) {
    const { left, width } = liRef.current.getBoundingClientRect();
    const center = left + width / 2;
    scale = 1 + (MAX_SCALE - 1) * gaussian(Math.abs(center - mouseX));
  }

  return (
    <li
      ref={liRef}
      className="tools-marquee-item mono"
      style={{
        transform: `scale(${scale.toFixed(3)})`,
        transformOrigin: "center bottom",
        /* Fast in, slow out — feels like the real dock */
        transition: mouseX === null
          ? "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)"
          : "transform 0.08s ease-out",
      }}
    >
      {maskUrl ? (
        <span
          className="tools-marquee-logo"
          aria-hidden="true"
          style={{ WebkitMaskImage: maskUrl, maskImage: maskUrl }}
        />
      ) : (
        <FallbackIcon />
      )}
      <span>{tool.name}</span>
      <span className="tools-marquee-sep" aria-hidden="true">·</span>
    </li>
  );
}

/* ── Marquee wrapper ── */
export function ToolsMarquee() {
  const [mouseX, setMouseX] = useState<number | null>(null);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseX(e.clientX);
  }, []);

  const onMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  return (
    <div
      className="tools-marquee-wrap"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <span className="tools-marquee-label mono">Built with</span>
      <div className="tools-marquee-overflow" aria-hidden="true">
        <ul className="tools-marquee-track">
          {[...TOOLS, ...TOOLS].map((tool, i) => (
            <ToolItem
              key={`${tool.name}-${i}`}
              tool={tool}
              mouseX={mouseX}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
