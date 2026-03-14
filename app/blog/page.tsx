import Link from "next/link";

import { getBlogPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog"
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <section className="section page-hero">
      <div className="container">
        <div className="page-intro">
          <div className="section-head section-head--intro">
            <div>
              <span className="eyebrow">Blog</span>
              <h1 className="section-title section-title--hero">
                Notes on AI agents, automation, and building
              </h1>
            </div>
            <p className="section-copy">
              Posts are authored in Markdown inside the project so writing stays
              lightweight and versioned with the site.
            </p>
          </div>
        </div>

        <div className="grid-2">
          {posts.map((post) => (
            <article key={post.slug} className="post-card">
              <div className="post-card__header">
                <div>
                  <span className="muted-label">{post.date}</span>
                  <h2 className="post-card__title">{post.title}</h2>
                </div>
                <span className="chip">{post.tags.join(" / ")}</span>
              </div>
              <p className="muted">{post.excerpt}</p>
              <Link className="button button--secondary" href={`/blog/${post.slug}`}>
                Read post
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
