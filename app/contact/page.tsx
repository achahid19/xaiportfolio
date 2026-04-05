import { ArrowRight, Github, Linkedin, Mail, Twitter } from "lucide-react";
import type { ReactNode } from "react";

import { ContactForm } from "@/components/contact-form";
import { profile } from "@/lib/site-data";

export const metadata = {
  title: "Contact",
};

const socialIcons: Record<string, ReactNode> = {
  GitHub: <Github size={15} strokeWidth={2.2} />,
  LinkedIn: <Linkedin size={15} strokeWidth={2.2} />,
  Email: <Mail size={15} strokeWidth={2.2} />,
  X: <Twitter size={15} strokeWidth={2.2} />,
};

export default function ContactPage() {
  const socialLinks = profile.socialLinks.filter(
    (link) =>
      !link.href.includes("your-handle") &&
      !link.href.includes("hello@example.com"),
  );

  return (
    <section className="page-hero section">
      <div className="container">
        <div className="page-intro animate-in">
          <div className="section-head section-head--intro">
            <div>
              <span className="eyebrow">Contact</span>
              <h1 className="section-title" style={{ marginTop: "0.75rem" }}>
                Start with the problem<br />you want to solve
              </h1>
            </div>
            <p className="section-copy">
              I work on workflow automation, AI agent builds, and product
              experiments. If you have a process that&apos;s manual, messy, or
              just waiting for an AI layer — let&apos;s talk.
            </p>
          </div>
        </div>

        <div className="split-grid" style={{ alignItems: "start" }}>
          {/* Left — context */}
          <article className="panel animate-in" style={{ display: "grid", gap: "1.5rem" }}>
            <div>
              <span className="muted-label">What to expect</span>
              <ul style={{ margin: "0.75rem 0 0", padding: 0, listStyle: "none", display: "grid", gap: "0.65rem" }}>
                {[
                  "I read every message personally",
                  "Typical reply within 24–48 hours",
                  "No sales pitch — just a real conversation",
                  "Happy to scope a quick idea or a full build",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      gap: "0.6rem",
                      alignItems: "flex-start",
                      color: "var(--ink-soft)",
                      fontSize: "0.95rem",
                      lineHeight: "1.55",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "6px",
                        height: "6px",
                        borderRadius: "999px",
                        background: "var(--accent-alt)",
                        flexShrink: 0,
                        marginTop: "0.55rem",
                      }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {socialLinks.length > 0 && (
              <div>
                <span className="muted-label">Find me elsewhere</span>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginTop: "0.75rem",
                  }}
                >
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      className="button button--secondary button--small"
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "inline-flex", gap: "0.4rem" }}
                    >
                      <span aria-hidden="true">
                        {socialIcons[link.label] ?? <Mail size={15} />}
                      </span>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{
                padding: "1.25rem",
                borderRadius: "20px",
                border: "1px solid var(--line)",
                background: "var(--surface-soft)",
              }}
            >
              <span className="muted-label">Good fit if…</span>
              <p
                className="muted"
                style={{ margin: "0.5rem 0 0", fontSize: "0.93rem" }}
              >
                You have a workflow that&apos;s mostly repetitive work, or an
                idea that needs an AI layer. I focus on n8n, Make, and
                LLM-powered agent pipelines.
              </p>
            </div>
          </article>

          {/* Right — form */}
          <article
            className="form-card animate-in"
            style={{ transitionDelay: "100ms" }}
          >
            <div style={{ marginBottom: "1.25rem" }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display), sans-serif",
                  fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
                  lineHeight: "0.97",
                }}
              >
                Send a direct message
              </h2>
              <p
                className="muted"
                style={{ marginTop: "0.6rem", fontSize: "0.93rem" }}
              >
                Tell me what you&apos;re building, automating, or where you&apos;re stuck.
              </p>
            </div>
            <ContactForm />
          </article>
        </div>
      </div>
    </section>
  );
}
