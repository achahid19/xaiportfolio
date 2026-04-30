import Link from "next/link";

import { Magnetic } from "@/components/magnetic";
import { SystemsGrid } from "@/components/systems-grid";
import { Workflow } from "@/components/workflow";
import { getBlogPosts } from "@/lib/blog";
import {
  profile,
  proofMetrics,
  services,
  systems,
  testimonials,
  trustTools
} from "@/lib/site-data";

export default async function HomePage() {
  const posts = await getBlogPosts();
  const featuredSystems = systems.filter((s) => s.featured);
  const systemCount = systems.length;

  return (
    <>
      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="hero-status mono">
              <span className="status-dot" />
              {systemCount} systems in production · Open to new work
            </div>
            <h1 className="hero-title">
              I build <span className="accent">AI agents</span>
              <br />
              and <span className="stroke">automation</span>
              <br />
              that pay for themselves.
            </h1>
            <p className="hero-copy">
              I&rsquo;m {profile.name} — an automation engineer turning slow,
              manual ops into reliable AI-powered systems. Real ROI, not demos.
            </p>
            <div className="hero-actions">
              <Magnetic>
                <Link className="btn btn-primary" href="/contact">
                  Discuss a workflow →
                </Link>
              </Magnetic>
              <Link className="btn btn-secondary" href="/systems">
                See {systemCount} systems shipped
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="num mono">
                  <span className="accent">{systemCount}+</span>
                </div>
                <div className="label mono">Systems shipped</div>
              </div>

              <div className="hero-badges">
                <span className="hero-badge-brand mono">n8n</span>
                <div className="hero-badge-row">
                  <a
                    href="https://n8n.io/creators/achahid19/"
                    target="_blank"
                    rel="noreferrer"
                    className="hero-badge mono"
                  >
                    <span className="hero-badge__icon">★</span>
                    Verified Creator
                    <span className="hero-badge__sep" />
                    3 templates
                    <span className="hero-badge__arrow">↗</span>
                  </a>
                  <a
                    href="https://academy.n8n.io/"
                    target="_blank"
                    rel="noreferrer"
                    className="hero-badge mono"
                  >
                    <span className="hero-badge__icon">⏱</span>
                    Course Level 1
                    <span className="hero-badge__arrow">↗</span>
                  </a>
                  <a
                    href="https://academy.n8n.io/"
                    target="_blank"
                    rel="noreferrer"
                    className="hero-badge mono"
                  >
                    <span className="hero-badge__icon">⏱</span>
                    Course Level 2
                    <span className="hero-badge__arrow">↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Workflow />
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ─────────────────────────────────────── */}
      <section className="container animate-in" style={{ paddingBottom: "32px" }}>
        <div className="logo-row mono">
          <span className="lbl">Built with</span>
          {trustTools.map((t, i) => (
            <span key={t}>
              {i > 0 && "· "}
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── SERVICES ────────────────────────────────────────── */}
      <section className="section" id="services">
        <div className="container">
          <div className="section-head animate-in">
            <div className="row">
              <div>
                <div className="eyebrow mono">What I deliver</div>
                <h2 className="section-title">
                  Three capabilities. Every system I ship is one of them.
                </h2>
              </div>
              <p className="section-sub">
                Every engagement starts with a measurable business problem.
                Tools come second.
              </p>
            </div>
          </div>
          <div className="services-grid animate-in">
            {services.map((s) => (
              <article key={s.num} className="service">
                <div className="service-num mono">{s.num} / 03</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <Link href="/systems" className="service-arrow mono">
                  View related systems →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── SYSTEMS PREVIEW ─────────────────────────────────── */}
      <section className="section" id="systems-preview">
        <div className="container">
          <div className="section-head animate-in">
            <div className="row">
              <div>
                <div className="eyebrow mono">
                  Selected work · {systemCount} in production
                </div>
                <h2 className="section-title">Systems built to deliver results.</h2>
              </div>
              <Magnetic>
                <Link className="btn btn-secondary" href="/systems">
                  Explore the library →
                </Link>
              </Magnetic>
            </div>
          </div>
          <div className="animate-in">
            <SystemsGrid systems={featuredSystems} />
          </div>
        </div>
      </section>

      {/* ── PROOF / RESULTS ─────────────────────────────────── */}
      <section className="section" id="results">
        <div className="container">
          <div className="about animate-in">
            <div className="about-text">
              <div className="eyebrow mono">Outcomes, in numbers</div>
              <h2 className="section-title" style={{ margin: "12px 0 24px" }}>
                I don&rsquo;t ship demos. I ship systems that move metrics.
              </h2>
              <p>
                Every system in the library was built to fix a measurable
                operational pain. Below are the deltas — measured before /
                after, in production.
              </p>
              <p>
                <strong>The pattern:</strong> identify the silent cost, isolate
                it, automate the loop, and hand back something the team can own
                without me.
              </p>
              <div className="hero-actions" style={{ marginTop: "24px" }}>
                <Magnetic>
                  <Link className="btn btn-primary" href="/contact">
                    Bring me a workflow →
                  </Link>
                </Magnetic>
              </div>
            </div>
            <div>
              <article className="about-card">
                <h4 className="mono">Measured impact across systems</h4>
                <ul className="metric-list mono">
                  {proofMetrics.map((m) => (
                    <li key={m.k}>
                      <span style={{ fontFamily: "var(--font-body)" }}>{m.k}</span>
                      <span className="v">{m.v}</span>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="about-card">
                <h4 className="mono">What clients say</h4>
                {testimonials.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: i === 0 ? "18px" : 0,
                      paddingBottom: i === 0 ? "18px" : 0,
                      borderBottom: i === 0 ? "1px dashed var(--hairline)" : "none"
                    }}
                  >
                    <p style={{ fontSize: "14.5px", lineHeight: 1.55, color: "var(--fg)" }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <p
                      className="mono"
                      style={{
                        fontSize: "11px",
                        color: "var(--fg-dim)",
                        marginTop: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      — {t.who}
                    </p>
                  </div>
                ))}
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT / SKILLS ──────────────────────────────────── */}
      <section className="section" id="about">
        <div className="container">
          <div className="about animate-in">
            <div className="about-text">
              <div className="eyebrow mono">About</div>
              <h2 className="section-title" style={{ margin: "12px 0 24px" }}>
                Business value first, technology second.
              </h2>
              <p>{profile.longBio}</p>
              <p>
                With a background in finance, I read the business logic behind
                every workflow — so what I build drives ROI, not technical
                complexity.
              </p>
            </div>
            <div>
              <article className="about-card">
                <h4 className="mono">Skills</h4>
                <div className="tag-row">
                  {profile.skills.map((s) => (
                    <span key={s} className="tool mono">{s}</span>
                  ))}
                </div>
              </article>
              <article className="about-card">
                <h4 className="mono">Tools I reach for</h4>
                <div className="tag-row">
                  {profile.tools.map((s) => (
                    <span key={s} className="tool mono">{s}</span>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ── NOTES TEASER ────────────────────────────────────── */}
      {posts.length > 0 && (
        <section className="section" id="notes">
          <div className="container">
            <div className="section-head animate-in">
              <div className="row">
                <div>
                  <div className="eyebrow mono">Notes</div>
                  <h2 className="section-title">Writing on AI &amp; automation.</h2>
                </div>
                <Link className="btn btn-secondary" href="/blog">
                  All notes →
                </Link>
              </div>
            </div>
            <div className="blog-list animate-in">
              {posts.slice(0, 3).map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="post">
                  <span className="post-date mono">{p.date}</span>
                  <div className="post-body">
                    <h3>{p.title}</h3>
                    <p>{p.excerpt}</p>
                  </div>
                  <span className="post-tag mono">
                    {p.tags[0] ?? "Note"} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="cta">
        <div className="cta-inner animate-in">
          <div className="eyebrow mono" style={{ justifyContent: "center", display: "inline-flex" }}>
            Ready to move faster?
          </div>
          <h2>Let&rsquo;s turn your process into a competitive edge.</h2>
          <p>
            Whether you have a clear scope or just a pain point worth solving —
            let&rsquo;s talk. I&rsquo;ll help you identify where automation
            delivers the most value and build the system.
          </p>
          <div className="cta-actions">
            <Magnetic>
              <Link className="btn btn-primary" href="/contact">
                Start the conversation →
              </Link>
            </Magnetic>
            <Link className="btn btn-secondary" href="/systems">
              Browse systems library
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
