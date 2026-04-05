import Image from "next/image";
import Link from "next/link";

import { profile } from "@/lib/site-data";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const socialLinks = profile.socialLinks.filter(
    (link) =>
      !link.href.includes("your-handle") &&
      !link.href.includes("hello@example.com"),
  );

  return (
    <footer className="footer-note">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-brand__lockup">
            <span className="footer-brand__mark" aria-hidden="true">
              <Image
                src="/images/aix_logo_no_bg.png"
                alt=""
                width={500}
                height={500}
                className=""
                sizes="(max-width: 640px) 52px, 64px"
                suppressHydrationWarning
              />
            </span>
            <div className="footer-brand__copy">
              <span className="eyebrow">AI X Automation</span>
              <h2 className="footer-title">Anas Chahid Ksabi</h2>
            </div>
          </div>
          <p className="muted">
            AI Agent & Workflow Automation Engineer helping businesses automate
            complex processes, integrate systems, and unlock real operational
            value through intelligent automation.
          </p>
        </div>

        <div className="footer-column">
          <span className="muted-label">Explore</span>
          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/#about">About</Link>
            <Link href="/#projects">Projects</Link>
            <Link href="/blog">Writing</Link>
          </div>
        </div>

        <div className="footer-column">
          <span className="muted-label">Connect</span>
          <div className="footer-links">
            <Link href="/contact">Contact</Link>
            <Link href="/guestbook">Guestbook</Link>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {currentYear} Anas Chahid Ksabi</span>
          <a href="https://aixautomation.tech" target="_blank" rel="noreferrer">
            aixautomation.tech
          </a>
        </div>
      </div>
    </footer>
  );
}
