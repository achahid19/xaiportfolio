import type { Metadata } from "next";

import { SocialFeed } from "@/components/social-feed";
import { achievements, socialPosts } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Social",
  description:
    "n8n challenges, AI agent builds, and automation content — shared on LinkedIn and the n8n community."
};

export default function SocialPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow mono">Social · {socialPosts.length} posts</div>
          <h1>
            Challenges, builds &amp; ideas.
            <br />
            <span style={{ color: "var(--fg-mute)" }}>Shared publicly.</span>
          </h1>
          <p>
            n8n community challenges, AI agent walkthroughs, and automation
            content — as it ships.
          </p>
        </div>
      </section>

      {/* Achievements */}
      <section className="container" style={{ paddingBottom: "56px" }}>
        <div className="section-head" style={{ marginBottom: "24px" }}>
          <div className="eyebrow mono">Achievements</div>
        </div>
        <div className="achievements-grid">
          {achievements.map((a) => (
            <a
              key={a.id}
              href={a.href}
              target="_blank"
              rel="noreferrer"
              className="achievement-card"
            >
              <div className="achievement-card__top">
                <span className="achievement-issuer mono">{a.issuer}</span>
                <span className="achievement-date mono">{a.date}</span>
              </div>
              <h3 className="achievement-card__title">{a.title}</h3>
              {a.description && (
                <p className="achievement-card__desc">{a.description}</p>
              )}
              <span className="achievement-card__cta mono">View credential ↗</span>
            </a>
          ))}
        </div>
      </section>

      {/* Posts */}
      <section className="container" style={{ paddingBottom: "96px" }}>
        <div className="section-head" style={{ marginBottom: "24px" }}>
          <div className="eyebrow mono">Posts</div>
        </div>
        <SocialFeed posts={socialPosts} />
      </section>
    </>
  );
}
