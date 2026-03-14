import Link from "next/link";

import { profile, projects, timeline } from "@/lib/site-data";
import { getBlogPosts } from "@/lib/blog";

export default async function HomePage() {
  const posts = await getBlogPosts();
  const featuredProjects = projects.filter((project) => project.featured);
  const displayName =
    profile.name === "Your Name"
      ? "AI Agent & Automation Builder"
      : profile.name;
  const socialLinks = profile.socialLinks.filter(
    (link) =>
      !link.href.includes("your-handle") &&
      !link.href.includes("hello@example.com"),
  );

  return (
    <>
      <section className="page-hero">
        <div className="container hero-grid">
          <div className="hero-main">
            <div className="hero-card">
              <span className="eyebrow">AI agents x workflow automation</span>
              <h1 className="hero-title">{displayName}</h1>
              <p className="hero-copy">{profile.headline}</p>
              <p className="hero-copy">{profile.longBio}</p>
              <div className="hero-actions">
                <Link className="button button--primary" href="#projects">
                  Explore my work
                </Link>
                <Link className="button button--secondary" href="#connect">
                  Jump to contact
                </Link>
              </div>
              <div className="hero-pills">
                <span className="chip">AI agents</span>
                <span className="chip">n8n workflows</span>
                <span className="chip">Product-minded engineering</span>
              </div>
            </div>

            <div className="hero-support-grid">
              <article className="stat-card">
                <span className="muted-label">Current focus</span>
                <h3>What I am building right now</h3>
                <ul className="detail-list">
                  {profile.currentFocus.map((item) => (
                    <li key={item} className="chip">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
              <article className="timeline-card">
                <span className="muted-label">Availability</span>
                <h3>Open to meaningful automation work</h3>
                <p className="muted">
                  I am interested in freelance work, product experiments, and
                  collaborations around AI workflows that solve a real problem.
                </p>
                <p className="muted">Base: {profile.location}</p>
                {socialLinks.length > 0 ? (
                  <div className="social-links">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        className="button button--secondary"
                        href={link.href}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                ) : (
                  <Link className="button button--secondary" href="/contact">
                    Add your real profile links next
                  </Link>
                )}
              </article>
            </div>
          </div>

          <div className="hero-side">
            <article className="portrait-card">
              <div className="portrait-card__media">
                <img
                  src="/images/portrait.png?v=2"
                  alt={`${profile.name} portrait`}
                  className="portrait-card__photo"
                />
              </div>
              <div className="portrait-card__caption">
                <span className="muted-label">Portrait</span>
                <p className="muted">
                  Building useful AI systems with a product mindset and a bias
                  toward clear automation.
                </p>
              </div>
            </article>
            <article className="panel hero-note">
              <span className="muted-label">Approach</span>
              <h3>Clear handoffs, visible systems, practical outcomes</h3>
              <ul className="hero-note__list">
                <li>Map the workflow before automating it</li>
                <li>Design agent outputs people can verify</li>
                <li>Keep the interface simple enough to trust</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="about">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">About me</span>
              <h2 className="section-title">
                A clearer story than a simple resume
              </h2>
            </div>
            <p className="section-copy">
              I am based around practical systems thinking: fewer repeated
              tasks, better decisions, and workflows that can survive real use.
            </p>
          </div>
          <div className="grid-3">
            <article className="panel">
              <h3>What I do</h3>
              <p className="muted">{profile.shortBio}</p>
            </article>
            <article className="panel">
              <h3>Skills</h3>
              <ul className="stack-list">
                {profile.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </article>
            <article className="panel">
              <h3>Tools I reach for</h3>
              <ul className="stack-list">
                {profile.tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Current path</span>
              <h2 className="section-title">
                How I am growing into this niche
              </h2>
            </div>
          </div>
          <div className="grid-3">
            {timeline.map((item) => (
              <article key={item.title} className="timeline-card">
                <span className="muted-label">{item.title}</span>
                <p className="muted">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="projects">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Selected projects</span>
              <h2 className="section-title">
                Practical systems, not concept art
              </h2>
            </div>
            <Link className="button button--secondary" href="/contact">
              Discuss a workflow
            </Link>
          </div>

          <div className="grid-2">
            {featuredProjects.map((project) => (
              <article key={project.slug} className="project-card">
                <div className="project-card__header">
                  <div>
                    <span className="kicker">{project.role}</span>
                    <h3 className="project-card__title">{project.title}</h3>
                  </div>
                  <span className="chip">Featured</span>
                </div>
                <p className="muted">{project.summary}</p>
                <p className="muted">
                  <strong>Problem:</strong> {project.problem}
                </p>
                <p className="muted">
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

      <section className="section section--alt" id="writing">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Writing</span>
              <h2 className="section-title">Blog posts for systems thinking</h2>
            </div>
            <Link className="button button--secondary" href="/blog">
              Read the blog
            </Link>
          </div>
          <div className="grid-2">
            {posts.slice(0, 2).map((post) => (
              <article key={post.slug} className="post-card">
                <div className="post-card__header">
                  <div>
                    <span className="muted-label">{post.date}</span>
                    <h3 className="post-card__title">{post.title}</h3>
                  </div>
                  <span className="chip">{post.tags[0]}</span>
                </div>
                <p className="muted">{post.excerpt}</p>
                <Link
                  className="button button--secondary"
                  href={`/blog/${post.slug}`}
                >
                  Open post
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="connect">
        <div className="container connect-grid">
          <article className="panel">
            <span className="eyebrow">Guestbook</span>
            <h2 className="section-title">Leave a visible note</h2>
            <p className="section-copy">
              The guestbook is a lightweight public wall for comments,
              collaboration hellos, and feedback.
            </p>
            <Link className="button button--primary" href="/guestbook">
              Open guestbook
            </Link>
          </article>

          <article className="panel">
            <span className="eyebrow">Contact</span>
            <h2 className="section-title">Reach out directly</h2>
            <p className="section-copy">
              Use the contact form if you want to collaborate, discuss an idea,
              or talk through an automation problem.
            </p>
            <Link className="button button--primary" href="/contact">
              Send a message
            </Link>
          </article>

          <article className="panel panel--highlight">
            <span className="eyebrow">Navigate faster</span>
            <h2 className="section-title">Choose the path that fits you</h2>
            <div className="action-list">
              <Link className="action-list__item" href="#about">
                <strong>Understand my background</strong>
                <span className="muted">
                  Read the story before the projects.
                </span>
              </Link>
              <Link className="action-list__item" href="#projects">
                <strong>See my practical work</strong>
                <span className="muted">Jump directly to featured builds.</span>
              </Link>
              <Link className="action-list__item" href="/blog">
                <strong>Read my thinking</strong>
                <span className="muted">
                  Open the blog and explore systems notes.
                </span>
              </Link>
            </div>
          </article>
        </div>
      </section>

      <footer className="footer-note">
        <div className="container">
          Built for Vercel with `Next.js`, Markdown content, and a guestbook
          flow that can evolve into a moderated community feature.
        </div>
      </footer>
    </>
  );
}
