import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.excerpt
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow mono">{post.tags.join(" / ")}</div>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="mono" style={{ fontSize: "12px", color: "var(--fg-dim)", marginTop: "16px", letterSpacing: "0.04em" }}>
            {post.date}
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "96px" }}>
        <article className="article-wrap">
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="article-cta">
            <p className="article-cta__text">
              Working on a similar challenge in your business?
            </p>
            <a href="/contact" className="article-cta__link mono">
              Let&rsquo;s talk →
            </a>
          </div>
        </article>
      </section>
    </>
  );
}
