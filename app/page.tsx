import Link from "next/link";
import { Github, Linkedin, Mail, Twitter, Workflow, BrainCircuit, Plug, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { profile, projects } from "@/lib/site-data";
import { getBlogPosts } from "@/lib/blog";
import { N8N_TEMPLATE_COUNT } from "@/lib/n8n";

const socialIcons: Record<string, ReactNode> = {
  GitHub: <Github size={15} strokeWidth={2.2} />,
  LinkedIn: <Linkedin size={15} strokeWidth={2.2} />,
  Email: <Mail size={15} strokeWidth={2.2} />,
  X: <Twitter size={15} strokeWidth={2.2} />,
};

const services = [
  {
    icon: <Workflow size={20} strokeWidth={2} />,
    title: "Process Automation",
    description:
      "Turn complex, multi-step business processes into reliable automated workflows. From lead handling to ops pipelines — I build systems that scale without adding headcount.",
  },
  {
    icon: <BrainCircuit size={20} strokeWidth={2} />,
    title: "AI Agent Development",
    description:
      "Deploy intelligent agents that research, decide, and act autonomously — handling tasks that previously required human judgment, at a fraction of the cost and time.",
  },
  {
    icon: <Plug size={20} strokeWidth={2} />,
    title: "System Integration",
    description:
      "Break down tool silos. I connect your CRMs, APIs, databases, and communication channels into a unified data layer that powers smarter, faster decisions.",
  },
];

export default async function HomePage() {
  const posts = await getBlogPosts();
  const n8nCount = N8N_TEMPLATE_COUNT;
  const featuredProjects = projects.filter((p) => p.featured);
  const socialLinks = profile.socialLinks.filter(
    (link) =>
      !link.href.includes("your-handle") &&
      !link.href.includes("hello@example.com"),
  );

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="page-hero">
        <div className="container hero-grid">
          <div className="hero-main">
            <span className="eyebrow">{profile.headline}</span>
            <h1 className="hero-title">{profile.name}</h1>
            <p className="hero-copy">{profile.longBio}</p>
            <div className="hero-actions">
              <Link className="button button--primary" href="/contact">
                Let&apos;s work together
                <ArrowRight size={16} strokeWidth={2.2} />
              </Link>
              <Link className="button button--secondary" href="#projects">
                View my work
              </Link>
            </div>
            <div className="hero-proof-grid">
              <article className="hero-proof-card">
                <span className="muted-label">Focus</span>
                <strong>AI &amp; automation</strong>
              </article>
              <article className="hero-proof-card">
                <span className="muted-label">Base</span>
                <strong>{profile.location}</strong>
              </article>
              <article className="hero-proof-card">
                <span className="muted-label">Open to</span>
                <strong>Freelance&nbsp;· CDI</strong>
              </article>
            </div>

            {/* ── n8n Credentials ───────────────────────────── */}
            <div className="n8n-creds">
              <span className="n8n-creds__brand" aria-label="n8n">n8n</span>

              <div className="n8n-creds__pills">
                {/* Creator pill */}
                <a
                  href="https://n8n.io/creators/anasks/"
                  target="_blank"
                  rel="noreferrer"
                  className="n8n-pill"
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M6 0L7.5 4.5H12L8.25 7.25L9.75 11.75L6 9L2.25 11.75L3.75 7.25L0 4.5H4.5L6 0Z" fill="#FF6D5A"/>
                  </svg>
                  <span>Verified Creator</span>
                  <span className="n8n-pill__count">{n8nCount || 1} template{n8nCount !== 1 ? "s" : ""}</span>
                  <span className="n8n-pill__arrow" aria-hidden="true">↗</span>
                </a>

                {/* Level 1 badge pill */}
                <a
                  href="https://community.n8n.io/badges/104/completed-n8n-course-level-1?username=anasks"
                  target="_blank"
                  rel="noreferrer"
                  className="n8n-pill n8n-pill--cert"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="14" r="7" stroke="#FF6D5A" strokeWidth="2"/>
                    <path d="M9 14l2 2 4-4" stroke="#FF6D5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8.5 7.5L7 3h10l-1.5 4.5" stroke="#FF6D5A" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>Course Level 1</span>
                  <span className="n8n-pill__arrow" aria-hidden="true">↗</span>
                </a>

                {/* Level 2 badge pill */}
                <a
                  href="https://community.n8n.io/badges/105/completed-n8n-course-level-2?username=anasks"
                  target="_blank"
                  rel="noreferrer"
                  className="n8n-pill n8n-pill--cert"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="14" r="7" stroke="#FF6D5A" strokeWidth="2"/>
                    <path d="M9 14l2 2 4-4" stroke="#FF6D5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8.5 7.5L7 3h10l-1.5 4.5" stroke="#FF6D5A" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="12" cy="14" r="3" fill="#FF6D5A" opacity="0.25"/>
                  </svg>
                  <span>Course Level 2</span>
                  <span className="n8n-pill__arrow" aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>

          <div className="hero-side">
            <article className="portrait-card">
              <div className="portrait-card__media" suppressHydrationWarning>
                <img
                  src="/images/portrait.png?v=2"
                  alt={`${profile.name} portrait`}
                  className="portrait-card__photo"
                  suppressHydrationWarning
                />
              </div>
              <div className="portrait-card__caption">
                <p className="muted" style={{ fontSize: "0.9rem", margin: 0 }}>
                  Helping businesses automate processes, reduce operational costs,
                  and scale intelligently with AI.
                </p>
                {socialLinks.length > 0 && (
                  <div className="portrait-card__links">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        className="button button--secondary button--small portrait-card__link"
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="portrait-card__link-icon" aria-hidden="true">
                          {socialIcons[link.label] ?? <Mail size={15} />}
                        </span>
                        <span className="portrait-card__link-label">{link.label}</span>
                      </a>
                    ))}
                  </div>
                )}
                <div className="portrait-card__cta">
                  <Link className="button button--primary button--small" href="/contact">
                    Discuss a workflow
                  </Link>
                </div>
              </div>
            </article>
          </div>

        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────── */}
      <section className="section section--alt" id="services">
        <div className="container">
          <div className="section-head animate-in">
            <div>
              <span className="eyebrow">What I deliver</span>
              <h2 className="section-title">Automation that drives real business outcomes</h2>
            </div>
            <p className="section-copy">
              Three capabilities that turn operational complexity into competitive advantage.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service, i) => (
              <article
                key={service.title}
                className="service-card animate-in"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="service-card__icon" aria-hidden="true">
                  {service.icon}
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ─────────────────────────────────────────── */}
      <section className="section" id="projects">
        <div className="container">
          <div className="section-head animate-in">
            <div>
              <span className="eyebrow">Selected work</span>
              <h2 className="section-title">Systems built to deliver results</h2>
            </div>
            <Link className="button button--secondary" href="/contact">
              Discuss a similar build
            </Link>
          </div>

          <div className="projects-grid">
            {featuredProjects.map((project, i) => (
              <article
                key={project.slug}
                className="project-card animate-in"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="project-card__header">
                  <div>
                    <span className="kicker">{project.role}</span>
                    <h3 className="project-card__title">{project.title}</h3>
                  </div>
                  <span className="chip">Featured</span>
                </div>
                <p className="muted" style={{ marginTop: "0.85rem" }}>{project.summary}</p>
                <p className="muted" style={{ marginTop: "0.5rem" }}>
                  <strong>Problem:</strong> {project.problem}
                </p>
                <p className="muted" style={{ marginTop: "0.3rem" }}>
                  <strong>Solution:</strong> {project.solution}
                </p>
                <ul className="stack-list">
                  {project.stack.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="project-card__actions">
                  <Link className="button button--secondary" href="/contact">
                    Talk about a similar build
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT + SKILLS ───────────────────────────────────── */}
      <section className="section section--alt" id="about">
        <div className="container">
          <div className="about-row">
            <article className="panel animate-in">
              <span className="eyebrow" style={{ marginBottom: "1rem", display: "inline-flex" }}>
                About me
              </span>
              <h3>Business value first, technology second</h3>
              <p className="muted">{profile.shortBio}</p>
              <p className="muted" style={{ marginTop: "0.75rem" }}>
                I approach every project as a business problem first. The
                automation is the vehicle — the outcome is faster processes,
                lower costs, and systems your team can actually trust and own.
              </p>
              <div className="hero-actions" style={{ marginTop: "1.25rem" }}>
                <Link className="button button--secondary" href="/blog">
                  Read my notes
                </Link>
              </div>
            </article>

            <div className="animate-in" style={{ transitionDelay: "100ms" }}>
              <article className="panel" style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Skills</h3>
                <div className="skills-wrap">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </article>

              <article className="panel">
                <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Tools I reach for</h3>
                <div className="skills-wrap">
                  {profile.tools.map((tool) => (
                    <span key={tool} className="skill-tag">{tool}</span>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ── WRITING TEASER ───────────────────────────────────── */}
      {posts.length > 0 && (
        <section className="section" id="writing">
          <div className="container">
            <div className="section-head animate-in">
              <div>
                <span className="eyebrow">Writing</span>
                <h2 className="section-title">Notes on AI &amp; automation</h2>
              </div>
              <Link className="button button--secondary" href="/blog">
                All posts
              </Link>
            </div>

            <div className="writing-grid">
              {posts.slice(0, 2).map((post, i) => (
                <article
                  key={post.slug}
                  className="post-card animate-in"
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  <div className="post-card__header">
                    <div>
                      <span className="muted-label">{post.date}</span>
                      <h3 className="post-card__title">{post.title}</h3>
                    </div>
                    <span className="chip">{post.tags[0]}</span>
                  </div>
                  <p className="muted" style={{ marginTop: "0.75rem" }}>{post.excerpt}</p>
                  <div style={{ marginTop: "1.25rem" }}>
                    <Link className="button button--secondary" href={`/blog/${post.slug}`}>
                      Read post
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SYSTEMS TEASER ───────────────────────────────────── */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head animate-in">
            <div>
              <span className="eyebrow">Systems library</span>
              <h2 className="section-title">Browse what I&apos;ve built</h2>
            </div>
            <Link className="button button--primary" href="/systems">
              View all systems
            </Link>
          </div>
          <p className="muted animate-in" style={{ maxWidth: "60ch", marginTop: "-0.5rem" }}>
            A searchable catalog of automation systems and AI agents — filterable by tool or business function.
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner animate-in">
            <div className="cta-glow" aria-hidden="true" />
            <span className="eyebrow">Ready to move faster?</span>
            <h2 className="cta-title">Let&apos;s turn your process into a competitive edge</h2>
            <p className="cta-copy">
              Whether you have a clear scope or just a pain point worth solving —
              let&apos;s talk. I&apos;ll help you identify where automation
              delivers the most value and build a system that actually ships.
            </p>
            <div className="cta-actions">
              <Link className="button button--primary" href="/contact">
                Start the conversation
                <ArrowRight size={16} strokeWidth={2.2} />
              </Link>
              <Link className="button button--secondary" href="/guestbook">
                Leave a note
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
