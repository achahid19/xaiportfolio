/**
 * AiX Automation — inline SVG logo component.
 *
 * variant="lockup"  icon + wordmark + divider + subtitle  (desktop nav)
 * variant="mark"    icon + wordmark only                  (footer / mobile nav)
 *
 * All colours use CSS classes tied to var(--accent) / var(--fg) / var(--line)
 * so the logo automatically matches the site accent in both themes.
 */

type Props = {
  variant?: "lockup" | "mark";
};

export function AixLogo({ variant = "lockup" }: Props) {
  if (variant === "lockup") {
    return (
      <svg
        width="200"
        height="36"
        viewBox="0 0 200 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="AI X Automation — AI Automation Engineer"
        role="img"
      >
        {/* ── Icon container ── */}
        <rect x="0" y="4" width="28" height="28" rx="4" className="logo-icon-bg logo-accent-border" strokeWidth="1" />

        {/* ── Three-circle signal mark ── */}
        <circle cx="8"  cy="18" r="3"   fill="none" className="logo-accent-muted-stroke" strokeWidth="1" />
        <circle cx="14" cy="18" r="4"   className="logo-accent-soft-fill logo-accent-ring"  strokeWidth="1.2" />
        <circle cx="14" cy="18" r="1.5" className="logo-accent-fill" />
        <circle cx="20" cy="18" r="3"   fill="none" className="logo-accent-muted-stroke" strokeWidth="1" />

        {/* ── Connector dashes ── */}
        <line x1="11"   y1="18" x2="11.5" y2="18" className="logo-accent-stroke" strokeWidth="1"   strokeDasharray="2 1.5" opacity="0.6" />
        <line x1="18"   y1="18" x2="18.5" y2="18" className="logo-accent-stroke" strokeWidth="1"   strokeDasharray="2 1.5" opacity="0.6" />

        {/* ── Corner brackets ── */}
        <path d="M2 8 L2 5 L5 5"       className="logo-accent-stroke" strokeWidth="1" strokeLinecap="square" />
        <path d="M2 28 L2 31 L5 31"    className="logo-accent-stroke" strokeWidth="1" strokeLinecap="square" />
        <path d="M26 5 L23 5 L23 8"    className="logo-accent-stroke" strokeWidth="1" strokeLinecap="square" />
        <path d="M26 31 L23 31 L23 28" className="logo-accent-stroke" strokeWidth="1" strokeLinecap="square" />

        {/* ── Wordmark ── */}
        <text x="36" y="25" fontFamily="ui-monospace,'SF Mono',Menlo,monospace" fontSize="22" fontWeight="700" letterSpacing="-1" className="logo-text-main">
          Ai<tspan className="logo-accent-fill">X</tspan>
        </text>

        {/* ── Divider ── */}
        <line x1="90" y1="8" x2="90" y2="28" className="logo-divider" strokeWidth="1" />

        {/* ── Subtitle ── */}
        <text x="98" y="17" fontFamily="ui-monospace,'SF Mono',Menlo,monospace" fontSize="8.5" letterSpacing="0.10em" className="logo-text-sub">AI AUTOMATION</text>
        <text x="98" y="28" fontFamily="ui-monospace,'SF Mono',Menlo,monospace" fontSize="8.5" letterSpacing="0.10em" className="logo-text-sub">ENGINEER</text>
      </svg>
    );
  }

  /* ── mark variant (icon + wordmark only) ── */
  return (
    <svg
      width="93"
      height="32"
      viewBox="0 0 140 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="AI X Automation"
      role="img"
    >
      {/* ── Icon container ── */}
      <rect x="0" y="6" width="36" height="36" rx="5" className="logo-icon-bg logo-accent-border" strokeWidth="1" />

      {/* ── Three-circle signal mark ── */}
      <circle cx="10" cy="24" r="4"   fill="none" className="logo-accent-muted-stroke" strokeWidth="1.2" />
      <circle cx="18" cy="24" r="5.5" className="logo-accent-soft-fill logo-accent-ring"  strokeWidth="1.5" />
      <circle cx="18" cy="24" r="2"   className="logo-accent-fill" />
      <circle cx="26" cy="24" r="4"   fill="none" className="logo-accent-muted-stroke" strokeWidth="1.2" />

      {/* ── Connector dashes ── */}
      <line x1="14"   y1="24" x2="14.5" y2="24" className="logo-accent-stroke" strokeWidth="1.2" strokeDasharray="2.5 2" opacity="0.65" />
      <line x1="23.5" y1="24" x2="24"   y2="24" className="logo-accent-stroke" strokeWidth="1.2" strokeDasharray="2.5 2" opacity="0.65" />

      {/* ── Corner brackets ── */}
      <path d="M3 12 L3 8 L7 8"       className="logo-accent-stroke" strokeWidth="1.2" strokeLinecap="square" />
      <path d="M3 36 L3 40 L7 40"     className="logo-accent-stroke" strokeWidth="1.2" strokeLinecap="square" />
      <path d="M33 8 L29 8 L29 12"    className="logo-accent-stroke" strokeWidth="1.2" strokeLinecap="square" />
      <path d="M33 40 L29 40 L29 36"  className="logo-accent-stroke" strokeWidth="1.2" strokeLinecap="square" />

      {/* ── Wordmark ── */}
      <text x="46" y="34" fontFamily="ui-monospace,'SF Mono',Menlo,monospace" fontSize="30" fontWeight="700" letterSpacing="-1.5" className="logo-text-main">
        Ai<tspan className="logo-accent-fill">X</tspan>
      </text>
    </svg>
  );
}
