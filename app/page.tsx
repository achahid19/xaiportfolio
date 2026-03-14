import Link from "next/link";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import type { ReactNode } from "react";

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
  const socialIcons: Record<string, ReactNode> = {
    GitHub: <Github size={16} strokeWidth={2.1} />,
    LinkedIn: <Linkedin size={16} strokeWidth={2.1} />,
    Email: <Mail size={16} strokeWidth={2.1} />,
    X: <Twitter size={16} strokeWidth={2.1} />,
  };
  return (
    <>
      <section className="page-hero">
        <div className="container hero-grid">
          <div className="hero-main">
            <div className="hero-card">
              <span className="eyebrow">{profile.headline}</span>
              <h1 className="hero-title">{displayName}</h1>
              <p className="hero-copy">{profile.longBio}</p>
              <div className="hero-actions">
                <Link className="button button--primary" href="#projects">
                  Explore my work
                </Link>
                <Link className="button button--secondary" href="/blog">
                  Read my notes
                </Link>
              </div>
              <div className="hero-proof-grid">
                <article className="hero-proof-card">
                  <span className="muted-label">Focus</span>
                  <strong>
                    AI agents, workflow automation, and product-minded execution
                  </strong>
                </article>
                <article className="hero-proof-card">
                  <span className="muted-label">Base</span>
                  <strong>{profile.location}</strong>
                </article>
                <article className="hero-proof-card">
                  <span className="muted-label">Open to</span>
                  <strong>
                    Freelance builds, experiments, and practical collaboration
                  </strong>
                </article>
              </div>
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
                <p className="muted">
                  Building useful AI systems with a product mindset and a bias
                  toward clear automation.
                </p>
                {socialLinks.length > 0 ? (
                  <div className="social-links portrait-card__links">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        className="button button--secondary button--small portrait-card__link"
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span
                          className="portrait-card__link-icon"
                          aria-hidden="true"
                        >
                          {socialIcons[link.label] ?? (
                            <Mail size={16} strokeWidth={2.1} />
                          )}
                        </span>
                        <span className="portrait-card__link-label">
                          {link.label}
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <Link
                    className="button button--secondary button--small"
                    href="/contact"
                  >
                    Add your real profile links next
                  </Link>
                )}
                <div className="portrait-card__cta">
                  <Link
                    className="button button--primary button--small"
                    href="/contact"
                  >
                    Discuss a workflow
                  </Link>
                </div>
              </div>
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
          <div className="about-grid">
            <article className="panel panel--story">
              <h3>What I do</h3>
              <p className="muted">{profile.shortBio}</p>
              <p className="muted">
                I care about automation that earns trust by being
                understandable, measurable, and genuinely useful to the people
                around it.
              </p>
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
          <div className="timeline-grid">
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

          <div className="projects-grid">
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
          <div className="writing-grid">
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
            <article className="panel panel--highlight writing-panel">
              <span className="muted-label">Writing system</span>
              <h3>Lightweight publishing, structured thinking</h3>
              <p className="muted">
                Posts live in Markdown inside the project, which keeps writing
                easy to publish and versioned with the site itself.
              </p>
              <Link className="button button--secondary" href="/blog">
                Browse all posts
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="connect">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Connect</span>
              <h2 className="section-title">Two clear ways to continue</h2>
            </div>
            <p className="section-copy">
              If you want to collaborate privately, use the contact form. If you
              want to leave a public hello, use the guestbook.
            </p>
          </div>
          <div className="connect-layout">
            <article className="panel connect-card">
              <span className="muted-label">Direct</span>
              <h3>Reach out about a project or idea</h3>
              <p className="muted">
                Use the contact form if you want to discuss a workflow problem,
                a potential collaboration, or a product experiment.
              </p>
              <Link className="button button--primary" href="/contact">
                Send a message
              </Link>
            </article>

            <article className="panel panel--highlight connect-card">
              <span className="muted-label">Public</span>
              <h3>Leave a note in the guestbook</h3>
              <p className="muted">
                The guestbook is a lightweight public wall for comments,
                collaboration hellos, and feedback from visitors.
              </p>
              <Link className="button button--secondary" href="/guestbook">
                Open guestbook
              </Link>
            </article>
          </div>
        </div>
      </section>

    </>
  );
}
