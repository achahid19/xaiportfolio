import Link from "next/link";

import { getBlogPosts } from "@/lib/blog";

export const metadata = {
  title: "Notes"
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow mono">Notes</div>
          <h1>
            Writing on AI, automation,
            <br />
            <span style={{ color: "var(--fg-mute)" }}>
              and the operational gap most teams miss.
            </span>
          </h1>
          <p>
            Field notes from real engagements — what worked, what I threw out,
            and the patterns worth stealing.
          </p>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "96px" }}>
        {posts.length === 0 ? (
          <div
            className="about-card"
            style={{ textAlign: "center", padding: "48px 32px" }}
          >
            <div className="mono" style={{ fontSize: "11px", color: "var(--fg-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Coming soon
            </div>
            <p style={{ color: "var(--fg-mute)", marginTop: "12px" }}>
              Posts are being drafted. Check back soon.
            </p>
          </div>
        ) : (
          <div className="blog-list">
            {posts.map((p) => (
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
        )}
      </section>
    </>
  );
}
