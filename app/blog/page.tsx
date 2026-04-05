import Link from "next/link";

import { getBlogPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <section className="page-hero section">
      <div className="container">
        <div className="page-intro animate-in">
          <div className="section-head section-head--intro">
            <div>
              <span className="eyebrow">Writing</span>
              <h1 className="section-title" style={{ marginTop: "0.75rem" }}>
                Notes on AI, automation,<br />and building
              </h1>
            </div>
            <p className="section-copy">
              Short posts on what I&apos;m learning, building, and thinking
              about as an AI automation engineer. Practical over theoretical.
            </p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div
            className="panel animate-in"
            style={{ textAlign: "center", padding: "3rem 2rem" }}
          >
            <span className="muted-label">Coming soon</span>
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              Posts are being drafted. Check back soon.
            </p>
          </div>
        ) : (
          <div className={posts.length === 1 ? "grid-1" : "grid-2"}>
            {posts.map((post, i) => (
              <article
                key={post.slug}
                className="post-card animate-in"
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className="post-card__header">
                  <div>
                    <span className="muted-label">{post.date}</span>
                    <h2
                      className="post-card__title"
                      style={{ marginTop: "0.3rem" }}
                    >
                      {post.title}
                    </h2>
                  </div>
                  <span className="chip">{post.tags.join(" / ")}</span>
                </div>
                <p className="muted" style={{ marginTop: "0.85rem" }}>
                  {post.excerpt}
                </p>
                <div style={{ marginTop: "1.25rem" }}>
                  <Link
                    className="button button--secondary"
                    href={`/blog/${post.slug}`}
                  >
                    Read post
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
