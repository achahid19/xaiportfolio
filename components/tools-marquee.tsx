"use client";

const TOOLS: ReadonlyArray<{ name: string; icon?: string }> = [
  { name: "n8n",             icon: "⚡" },
  { name: "Make",            icon: "🔗" },
  { name: "OpenAI",          icon: "◎" },
  { name: "Claude",          icon: "◈" },
  { name: "OpenRouter",      icon: "⇄" },
  { name: "Firecrawl",       icon: "🔥" },
  { name: "Postgres",        icon: "🗄" },
  { name: "Vercel",          icon: "▲" },
  { name: "GitHub",          icon: "⌥" },
  { name: "Docker",          icon: "🐳" },
  { name: "Slack",           icon: "◉" },
  { name: "Gmail",           icon: "✉" },
  { name: "Google Calendar", icon: "📅" },
  { name: "Jira",            icon: "◈" },
  { name: "Notion",          icon: "□" },
  { name: "Webhooks",        icon: "⇡" },
];

export function ToolsMarquee() {
  return (
    <div className="tools-marquee-wrap">
      <span className="tools-marquee-label mono">Built with</span>
      <div className="tools-marquee-overflow" aria-hidden="true">
        <ul className="tools-marquee-track">
          {/* Render twice for seamless loop */}
          {[...TOOLS, ...TOOLS].map((tool, i) => (
            <li key={i} className="tools-marquee-item mono">
              <span className="tools-marquee-icon">{tool.icon}</span>
              {tool.name}
              <span className="tools-marquee-sep">·</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
