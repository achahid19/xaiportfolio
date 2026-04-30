import Link from "next/link";

import { profile } from "@/lib/site-data";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const socialLinks = profile.socialLinks.filter(
    (link) =>
      !link.href.includes("your-handle") &&
      !link.href.includes("hello@example.com")
  );
  const emailLink = socialLinks.find((s) => s.label === "Email");
  const email = emailLink?.href.replace("mailto:", "") ?? "";

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Link className="logo" href="/">
            <span className="logo-mark mono" aria-hidden="true">▲</span>
            <span>
              anasks<small>.dev</small>
            </span>
          </Link>
          <p className="footer-tag mono">
            AI agents &amp; workflow automation, shipped.
            <br />
            Based in Casablanca · working worldwide.
          </p>
        </div>

        <div className="footer-col">
          <h5 className="mono">Pages</h5>
          <Link href="/">Home</Link>
          <Link href="/systems">Systems</Link>
          <Link href="/blog">Notes</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/guestbook">Guestbook</Link>
        </div>

        <div className="footer-col">
          <h5 className="mono">Elsewhere</h5>
          {socialLinks
            .filter((s) => s.label !== "Email")
            .map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                {s.label} ↗
              </a>
            ))}
        </div>

        <div className="footer-col">
          <h5 className="mono">Direct</h5>
          {email && <a href={`mailto:${email}`}>{email}</a>}
        </div>
      </div>

      <div className="footer-bottom mono">
        <span>© {currentYear} {profile.name} · Built clean, shipped fast.</span>
        <span>v3.0 · redesigned 2026.04</span>
      </div>
    </footer>
  );
}
