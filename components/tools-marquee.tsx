"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Tools marquee with macOS-dock magnification.
 *
 * Two fixes vs. the broken first attempt:
 *  1. transformOrigin "center center" → item grows symmetrically, no top-clip.
 *  2. Proportional horizontal margin → neighbours physically push apart.
 */

interface Tool {
  name: string;
  slug?: string;
  icon?: string; // custom SVG path(s) for tools not in Simple Icons
}

const TOOLS: ReadonlyArray<Tool> = [
  { name: "n8n",             slug: "n8n" },
  { name: "Make",            slug: "make" },
  { name: "OpenAI",          slug: "openai" },
  { name: "Anthropic",       slug: "anthropic" },
  { name: "Firecrawl",       icon: "M12 2c0 0-4 4-4 8a4 4 0 0 0 8 0c0-1.5-.5-3-1.5-4C14 8 13 10 12 10s-1-1.5-1-2.5C11 5.5 12 2 12 2zM9 14c0 2 1.3 3.5 3 3.5S15 16 15 14" },
  { name: "OpenRouter",      slug: "openrouter" },
  { name: "PostgreSQL",      slug: "postgresql" },
  { name: "Vercel",          slug: "vercel" },
  { name: "GitHub",          slug: "github" },
  { name: "Docker",          slug: "docker" },
  { name: "Slack",           slug: "slack" },
  { name: "Gmail",           slug: "gmail" },
  { name: "Google Calendar", slug: "googlecalendar" },
  { name: "Jira",            slug: "jira" },
  { name: "Notion",          slug: "notion" },
  { name: "Webhooks",        icon: "M14 2a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-2.8-2H8.5A4.5 4.5 0 0 0 4 10.5 4.5 4.5 0 0 0 8.5 15H9a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 1.2-2.4A6.5 6.5 0 0 1 2 10.5 6.5 6.5 0 0 1 8.5 4h2.7A3 3 0 0 1 14 2z" },
  { name: "Airtable",        slug: "airtable" },
  { name: "CRMs",            slug: "hubspot" },
  { name: "AI Agents",       slug: "langchain" },
];

const CDN       = "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons";
const MAX_SCALE = 1.28;   // peak scale at cursor
const SIGMA     = 90;     // px — spread width of the magnification wave

function gaussian(dist: number) {
  return Math.exp(-(dist * dist) / (2 * SIGMA * SIGMA));
}


/* ── Single pill ── */
function ToolItem({ tool, mouseX }: { tool: Tool; mouseX: number | null }) {
  const liRef   = useRef<HTMLLIElement>(null);
  const maskUrl  = tool.slug ? `url(${CDN}/${tool.slug}.svg)` : undefined;
  const iconPath = tool.icon;

  /* Gaussian factor + highlight */
  let g        = 0;
  let isActive = false;
  if (mouseX !== null && liRef.current) {
    const { left, width } = liRef.current.getBoundingClientRect();
    // Distance from nearest horizontal edge (0 = cursor is inside item bounds)
    const dist = mouseX < left         ? left - mouseX
               : mouseX > left + width ? mouseX - (left + width)
               : 0;
    g = gaussian(dist);
    /*
     * Highlight ONLY when cursor is horizontally inside this item (dist=0).
     * Scale uses the gaussian so neighbours still magnify — but colour
     * highlight is exclusive to the item you're actually over.
     */
    isActive = dist === 0;
  }

  const scale   = 1 + (MAX_SCALE - 1) * g;
  const extraMx = `${((scale - 1) * 28).toFixed(1)}px`;
  const easing  = mouseX === null
    ? "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), margin 0.45s cubic-bezier(0.34,1.56,0.64,1)"
    : "transform 0.08s ease-out, margin 0.08s ease-out";

  const colorTransition = "color 0.12s ease, background-color 0.12s ease";
  const logoColor = isActive ? "var(--accent)" : "var(--fg-dim)";
  const textColor = isActive ? "var(--fg)"     : "var(--fg-dim)";

  return (
    <li
      ref={liRef}
      className="tools-marquee-item mono"
      style={{
        transform      : `scale(${scale.toFixed(3)})`,
        transformOrigin: "center center",
        marginLeft     : extraMx,
        marginRight    : extraMx,
        transition     : easing,
        color          : textColor,
      }}
    >
      {maskUrl ? (
        <span
          className="tools-marquee-logo"
          aria-hidden="true"
          style={{
            WebkitMaskImage : maskUrl,
            maskImage        : maskUrl,
            backgroundColor  : logoColor,
            transition       : colorTransition,
          }}
        />
      ) : iconPath ? (
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
          style={{ color: logoColor, transition: colorTransition, flexShrink: 0 }}
        >
          <path d={iconPath} />
        </svg>
      ) : (
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
          style={{ color: logoColor, transition: colorTransition, flexShrink: 0 }}
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      )}
      <span style={{ transition: colorTransition }}>{tool.name}</span>
      <span className="tools-marquee-sep" aria-hidden="true">·</span>
    </li>
  );
}

/* ── Marquee ── */
export function ToolsMarquee() {
  const [mouseX, setMouseX] = useState<number | null>(null);

  const onMove  = useCallback((e: React.MouseEvent) => setMouseX(e.clientX), []);
  const onLeave = useCallback(() => setMouseX(null), []);

  return (
    <div className="tools-marquee-wrap" onMouseMove={onMove} onMouseLeave={onLeave}>
      <span className="tools-marquee-label mono">Built with</span>
      <div className="tools-marquee-overflow" aria-hidden="true">
        <ul className="tools-marquee-track">
          {[...TOOLS, ...TOOLS].map((tool, i) => (
            <ToolItem key={`${tool.name}-${i}`} tool={tool} mouseX={mouseX} />
          ))}
        </ul>
      </div>
    </div>
  );
}
