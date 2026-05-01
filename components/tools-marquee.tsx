"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Tools marquee — spotlight + lift effect.
 *
 * Instead of scaling the whole pill (which makes text look huge),
 * we apply three layered effects driven by a gaussian curve:
 *   1. Item lifts up (translateY)
 *   2. Distant items dim (opacity)
 *   3. Icon scales slightly — text size never changes
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

const CDN      = "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons";
const MAX_LIFT = 7;    // px upward at cursor
const MAX_ICON = 0.4;  // icon grows by up to 40% (1.0 → 1.4)
const SIGMA    = 88;   // px — spread of the spotlight

function gaussian(dist: number) {
  return Math.exp(-(dist * dist) / (2 * SIGMA * SIGMA));
}

function FallbackIcon({ scale }: { scale: number }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className="tools-marquee-svg-fallback" aria-hidden="true"
      style={{ transform: `scale(${scale.toFixed(3)})` }}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function ToolItem({ tool, mouseX }: { tool: Tool; mouseX: number | null }) {
  const liRef  = useRef<HTMLLIElement>(null);
  const maskUrl = tool.slug ? `url(${CDN}/${tool.slug}.svg)` : undefined;

  // Gaussian factor: 1 at cursor, falls off with distance
  let g = 0;
  if (mouseX !== null && liRef.current) {
    const { left, width } = liRef.current.getBoundingClientRect();
    g = gaussian(Math.abs(left + width / 2 - mouseX));
  }

  const isHovering = mouseX !== null;
  const lift       = -(MAX_LIFT * g);
  const iconScale  = 1 + MAX_ICON * g;
  // Spotlight: full opacity at cursor, dim everything else while hovering
  const opacity    = isHovering ? 0.18 + 0.82 * g : 0.55;

  const motionTransition = isHovering
    ? "transform 0.1s ease-out"
    : "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)";

  const opacityTransition = isHovering
    ? "opacity 0.12s ease-out"
    : "opacity 0.35s ease";

  return (
    <li
      ref={liRef}
      className="tools-marquee-item mono"
      style={{
        transform : `translateY(${lift.toFixed(2)}px)`,
        opacity   : opacity.toFixed(3),
        transition: `${motionTransition}, ${opacityTransition}`,
      }}
    >
      {maskUrl ? (
        <span
          className="tools-marquee-logo"
          aria-hidden="true"
          style={{
            WebkitMaskImage: maskUrl,
            maskImage       : maskUrl,
            transform       : `scale(${iconScale.toFixed(3)})`,
            transition      : motionTransition,
          }}
        />
      ) : (
        <FallbackIcon scale={iconScale} />
      )}
      <span>{tool.name}</span>
      <span className="tools-marquee-sep" aria-hidden="true">·</span>
    </li>
  );
}

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
